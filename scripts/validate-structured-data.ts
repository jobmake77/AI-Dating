#!/usr/bin/env tsx

/**
 * 结构化数据验证脚本
 *
 * 用于验证网站上的结构化数据是否符合 Schema.org 规范
 *
 * 使用方法:
 * npm run validate-structured-data
 *
 * 或者验证特定 URL:
 * npm run validate-structured-data -- --url=https://example.com/post/123
 */

import { JSDOM } from 'jsdom'
import { createClient } from '@supabase/supabase-js'

interface ValidationResult {
  url: string
  valid: boolean
  schemas: string[]
  errors: string[]
  warnings: string[]
}

interface ValidationTarget {
  path: string
  expectedTypes: string[]
}

type StructuredDataValue = string | number | boolean | null | undefined | StructuredDataValue[] | { [key: string]: StructuredDataValue }
type StructuredDataObject = {
  [key: string]: StructuredDataValue
  '@context'?: string
  '@type'?: string
  headline?: string
  author?: StructuredDataValue
  datePublished?: string
  publisher?: StructuredDataValue
  name?: string
  startDate?: string
  location?: StructuredDataValue
  itemListElement?: StructuredDataObject[]
  position?: number
}

const FALLBACK_TARGETS: ValidationTarget[] = [
  { path: '/post/example-id', expectedTypes: ['Article'] },
  { path: '/u/example-username', expectedTypes: ['Person'] },
  { path: '/events/example-event-id', expectedTypes: ['Event'] },
  { path: '/communities/example-slug', expectedTypes: ['Organization'] },
]

/**
 * 从 HTML 中提取结构化数据
 */
function extractStructuredData(html: string): StructuredDataObject[] {
  const dom = new JSDOM(html)
  const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]')

  const data: StructuredDataObject[] = []
  scripts.forEach((script: Element) => {
    try {
      const json = JSON.parse(script.textContent || '')
      data.push(json)
    } catch (error) {
      console.error('Failed to parse JSON-LD:', error)
    }
  })

  return data
}

function inferExpectedTypes(url: string) {
  const pathname = new URL(url).pathname

  if (pathname.startsWith('/post/')) return ['Article']
  if (pathname.startsWith('/u/')) return ['Person']
  if (pathname.startsWith('/events/')) return ['Event']
  if (pathname.startsWith('/communities/')) return ['Organization']

  return []
}

function isLikelyNotFoundPage(html: string) {
  const dom = new JSDOM(html)
  const bodyText = dom.window.document.body.textContent || ''

  return bodyText.includes('页面未找到')
}

async function resolveDefaultTargets(baseUrl: string): Promise<Array<{ url: string; expectedTypes: string[] }>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  未检测到可用的 Supabase 环境变量，回退到示例路径。')
    return FALLBACK_TARGETS.map((target) => ({
      url: `${baseUrl}${target.path}`,
      expectedTypes: target.expectedTypes,
    }))
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [postResult, userResult, eventResult, communityResult] = await Promise.all([
    supabase
      .from('contents')
      .select('id')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('users')
      .select('username')
      .not('username', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('events')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('communities')
      .select('slug')
      .eq('type', 'public')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const targets: Array<{ url: string; expectedTypes: string[] }> = []

  if (postResult.data?.id) {
    targets.push({ url: `${baseUrl}/post/${postResult.data.id}`, expectedTypes: ['Article'] })
  }

  if (userResult.data?.username) {
    targets.push({ url: `${baseUrl}/u/${userResult.data.username}`, expectedTypes: ['Person'] })
  }

  if (eventResult.data?.id) {
    targets.push({ url: `${baseUrl}/events/${eventResult.data.id}`, expectedTypes: ['Event'] })
  }

  if (communityResult.data?.slug) {
    targets.push({ url: `${baseUrl}/communities/${communityResult.data.slug}`, expectedTypes: ['Organization'] })
  }

  if (targets.length === 0) {
    console.log('⚠️  未查询到可用的真实数据，回退到示例路径。')
    return FALLBACK_TARGETS.map((target) => ({
      url: `${baseUrl}${target.path}`,
      expectedTypes: target.expectedTypes,
    }))
  }

  return targets
}

/**
 * 验证结构化数据
 */
function validateStructuredData(data: StructuredDataObject): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!data['@context']) {
    errors.push('Missing @context')
  } else if (data['@context'] !== 'https://schema.org') {
    warnings.push(`Unexpected @context: ${data['@context']}`)
  }

  if (!data['@type']) {
    errors.push('Missing @type')
  }

  // 根据类型验证必需字段
  switch (data['@type']) {
    case 'Article':
      if (!data.headline) errors.push('Article missing headline')
      if (!data.author) errors.push('Article missing author')
      if (!data.datePublished) errors.push('Article missing datePublished')
      if (!data.publisher) errors.push('Article missing publisher')
      break

    case 'Person':
      if (!data.name) errors.push('Person missing name')
      break

    case 'Event':
      if (!data.name) errors.push('Event missing name')
      if (!data.startDate) errors.push('Event missing startDate')
      if (!data.location) errors.push('Event missing location')
      break

    case 'Organization':
      if (!data.name) errors.push('Organization missing name')
      break

    case 'BreadcrumbList':
      if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
        errors.push('BreadcrumbList missing itemListElement array')
      } else {
        data.itemListElement.forEach((item, index) => {
          if (!item['@type'] || item['@type'] !== 'ListItem') {
            errors.push(`BreadcrumbList item ${index} missing @type ListItem`)
          }
          if (typeof item.position !== 'number') {
            errors.push(`BreadcrumbList item ${index} missing position`)
          }
          if (!item.name) {
            errors.push(`BreadcrumbList item ${index} missing name`)
          }
        })
      }
      break
  }

  return { errors, warnings }
}

/**
 * 验证单个 URL
 */
async function validateUrl(url: string, expectedTypes: string[] = inferExpectedTypes(url)): Promise<ValidationResult> {
  const result: ValidationResult = {
    url,
    valid: true,
    schemas: [],
    errors: [],
    warnings: [],
  }

  try {
    console.log(`\n验证 URL: ${url}`)

    // 注意：这里需要实际的 HTTP 请求来获取页面内容
    // 在实际使用中，你需要启动开发服务器或使用生产环境 URL
    console.log('⚠️  提示：请确保开发服务器正在运行，或使用生产环境 URL')

    const response = await fetch(url)
    if (!response.ok) {
      result.valid = false
      result.errors.push(`HTTP ${response.status}: ${response.statusText}`)
      return result
    }

    const html = await response.text()

    if (isLikelyNotFoundPage(html)) {
      result.valid = false
      result.errors.push('Resolved to not-found page')
      return result
    }

    const structuredData = extractStructuredData(html)

    if (structuredData.length === 0) {
      result.valid = false
      result.errors.push('No structured data found')
      return result
    }

    console.log(`✓ 找到 ${structuredData.length} 个结构化数据块`)

    structuredData.forEach((data, index) => {
      const schemaType = data['@type'] || 'Unknown'
      result.schemas.push(schemaType)
      console.log(`  ${index + 1}. ${schemaType}`)

      const validation = validateStructuredData(data)
      result.errors.push(...validation.errors)
      result.warnings.push(...validation.warnings)
    })

    if (expectedTypes.length > 0 && !expectedTypes.some((type) => result.schemas.includes(type))) {
      result.errors.push(`Expected schema type missing: ${expectedTypes.join(' or ')}`)
    }

    if (result.errors.length > 0) {
      result.valid = false
    }
  } catch (error) {
    result.valid = false
    result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 结构化数据验证工具\n')
  console.log('=' .repeat(60))

  const args = process.argv.slice(2)
  const urlArg = args.find((arg) => arg.startsWith('--url='))
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let targets: Array<{ url: string; expectedTypes: string[] }>
  if (urlArg) {
    const url = urlArg.split('=')[1]
    targets = [{ url, expectedTypes: inferExpectedTypes(url) }]
  } else {
    targets = await resolveDefaultTargets(baseUrl)
  }

  const results: ValidationResult[] = []

  for (const target of targets) {
    const result = await validateUrl(target.url, target.expectedTypes)
    results.push(result)

    // 打印结果
    if (result.valid) {
      console.log('✅ 验证通过')
    } else {
      console.log('❌ 验证失败')
    }

    if (result.errors.length > 0) {
      console.log('\n错误:')
      result.errors.forEach((error) => console.log(`  ❌ ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log('\n警告:')
      result.warnings.forEach((warning) => console.log(`  ⚠️  ${warning}`))
    }

    console.log('=' .repeat(60))
  }

  // 总结
  const totalValid = results.filter((r) => r.valid).length
  const totalInvalid = results.length - totalValid

  console.log('\n📊 验证总结:')
  console.log(`  总计: ${results.length} 个 URL`)
  console.log(`  通过: ${totalValid}`)
  console.log(`  失败: ${totalInvalid}`)

  if (totalInvalid > 0) {
    console.log('\n💡 提示:')
    console.log('  1. 使用 Google Rich Results Test 进一步验证:')
    console.log('     https://search.google.com/test/rich-results')
    console.log('  2. 使用 Schema.org Validator:')
    console.log('     https://validator.schema.org/')
    process.exit(1)
  }

  console.log('\n✅ 所有 URL 验证通过！')
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { validateUrl, validateStructuredData, extractStructuredData }
