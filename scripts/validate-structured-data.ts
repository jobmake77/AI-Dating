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

interface ValidationResult {
  url: string
  valid: boolean
  schemas: string[]
  errors: string[]
  warnings: string[]
}

// 测试 URL 列表
const TEST_URLS = [
  '/post/example-id',
  '/u/example-username',
  '/events/example-event-id',
  '/communities/example-slug',
]

/**
 * 从 HTML 中提取结构化数据
 */
function extractStructuredData(html: string): any[] {
  const dom = new JSDOM(html)
  const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]')

  const data: any[] = []
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

/**
 * 验证结构化数据
 */
function validateStructuredData(data: any): { errors: string[]; warnings: string[] } {
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
        data.itemListElement.forEach((item: any, index: number) => {
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
async function validateUrl(url: string): Promise<ValidationResult> {
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

  let urls: string[]
  if (urlArg) {
    const url = urlArg.split('=')[1]
    urls = [url]
  } else {
    urls = TEST_URLS.map((path) => `${baseUrl}${path}`)
  }

  const results: ValidationResult[] = []

  for (const url of urls) {
    const result = await validateUrl(url)
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

