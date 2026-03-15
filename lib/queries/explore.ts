import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import {
  getCategoryAliases,
  matchesCategoryValue,
} from '@/lib/utils/categories'
import { getContentCategories } from '@/lib/queries/content-categories'

export interface ExploreParams {
  page?: number
  limit?: number
  category?: string
  tag?: string
  search?: string
}

export interface ExploreCategory {
  id: string
  name: string
  slug: string
  description?: string
  postCount: number
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface CategoryMatcher {
  id: string
  name: string
  slug: string
  description?: string
  aliases: string[]
}

interface MatchedTagRow {
  id: string
  name: string | null
  slug: string | null
}

function normalizeTagValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

async function buildCategoryMatchers(categorySlugs?: string[]): Promise<CategoryMatcher[]> {
  const configuredCategories = await getContentCategories()
  const filteredCategories = categorySlugs?.length
    ? configuredCategories.filter((category) => categorySlugs.includes(category.slug))
    : configuredCategories

  return filteredCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    aliases: getCategoryAliases(category.slug),
  }))
}

async function getMatchedTags(
  supabase: SupabaseServerClient,
  values: string[]
): Promise<MatchedTagRow[]> {
  const exactValues = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))

  if (exactValues.length === 0) {
    return []
  }

  const slugValues = Array.from(new Set(exactValues.map(normalizeTagValue)))

  const [{ data: tagsByName, error: tagsByNameError }, { data: tagsBySlug, error: tagsBySlugError }] =
    await Promise.all([
      supabase.from('tags').select('id, name, slug').in('name', exactValues),
      supabase.from('tags').select('id, name, slug').in('slug', slugValues),
    ])

  if (tagsByNameError) {
    logger.error('Failed to fetch tags by name for explore filters:', tagsByNameError)
  }

  if (tagsBySlugError) {
    logger.error('Failed to fetch tags by slug for explore filters:', tagsBySlugError)
  }

  const matchedTags = new Map<string, MatchedTagRow>()

  ;[...(tagsByName || []), ...(tagsBySlug || [])].forEach((tag) => {
    matchedTags.set(tag.id, tag)
  })

  return Array.from(matchedTags.values())
}

async function getApprovedContentIdsForTagValues(
  supabase: SupabaseServerClient,
  values: string[]
): Promise<string[]> {
  const exactValues = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))

  if (exactValues.length === 0) {
    return []
  }

  const legacyValues = Array.from(new Set([...exactValues, ...exactValues.map(normalizeTagValue)]))

  const [matchedTags, legacyContentsResult] = await Promise.all([
    getMatchedTags(supabase, exactValues),
    supabase
      .from('contents')
      .select('id')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .overlaps('tags', legacyValues),
  ])

  if (legacyContentsResult.error) {
    logger.error('Failed to fetch legacy tag matches for explore filters:', legacyContentsResult.error)
  }

  const contentIds = new Set<string>((legacyContentsResult.data || []).map((content) => content.id))

  if (matchedTags.length > 0) {
    const { data: contentTags, error: contentTagsError } = await supabase
      .from('content_tags')
      .select('content_id, contents!inner(id, status, deleted_at)')
      .in('tag_id', matchedTags.map((tag) => tag.id))
      .eq('contents.status', 'approved')
      .is('contents.deleted_at', null)

    if (contentTagsError) {
      logger.error('Failed to fetch content tags for explore filters:', contentTagsError)
    } else {
      contentTags.forEach((contentTag: { content_id: string }) => {
        contentIds.add(contentTag.content_id)
      })
    }
  }

  return Array.from(contentIds)
}

async function getApprovedContentIdsByCategories(
  supabase: SupabaseServerClient,
  categorySlugs?: string[]
): Promise<Map<string, Set<string>>> {
  const matchers = await buildCategoryMatchers(categorySlugs)
  const contentIdsByCategory = new Map<string, Set<string>>(
    matchers.map((matcher) => [matcher.slug, new Set<string>()])
  )

  if (matchers.length === 0) {
    return contentIdsByCategory
  }

  const categoryValues = Array.from(
    new Set(matchers.flatMap((matcher) => matcher.aliases.map((alias) => alias.trim())).filter(Boolean))
  )
  const legacyValues = Array.from(
    new Set([...categoryValues, ...categoryValues.map(normalizeTagValue)])
  )

  const [matchedTags, directCategoryContentsResult, legacyContentsResult] = await Promise.all([
    getMatchedTags(supabase, categoryValues),
    supabase
      .from('contents')
      .select('id, category, tags')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .in('category', matchers.map((matcher) => matcher.slug)),
    supabase
      .from('contents')
      .select('id, category, tags')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .overlaps('tags', legacyValues),
  ])

  if (directCategoryContentsResult.error) {
    logger.error('Failed to fetch direct category matches for explore:', directCategoryContentsResult.error)
  }

  if (legacyContentsResult.error) {
    logger.error('Failed to fetch legacy category matches for explore:', legacyContentsResult.error)
  }

  const tagIdToCategorySlugs = new Map<string, string[]>()

  matchedTags.forEach((tag) => {
    const matchedCategorySlugs = new Set<string>()

    matchers.forEach((matcher) => {
      if (
        (tag.name && matchesCategoryValue(matcher.slug, tag.name)) ||
        (tag.slug && matchesCategoryValue(matcher.slug, tag.slug))
      ) {
        matchedCategorySlugs.add(matcher.slug)
      }
    })

    if (matchedCategorySlugs.size > 0) {
      tagIdToCategorySlugs.set(tag.id, Array.from(matchedCategorySlugs))
    }
  })

  if (tagIdToCategorySlugs.size > 0) {
    const { data: contentTags, error: contentTagsError } = await supabase
      .from('content_tags')
      .select('content_id, tag_id, contents!inner(id, status, deleted_at)')
      .in('tag_id', Array.from(tagIdToCategorySlugs.keys()))
      .eq('contents.status', 'approved')
      .is('contents.deleted_at', null)

    if (contentTagsError) {
      logger.error('Failed to fetch category relations for explore:', contentTagsError)
    } else {
      contentTags.forEach((contentTag: { content_id: string; tag_id: string }) => {
        tagIdToCategorySlugs.get(contentTag.tag_id)?.forEach((categorySlug) => {
          contentIdsByCategory.get(categorySlug)?.add(contentTag.content_id)
        })
      })
    }
  }

  ;[...(directCategoryContentsResult.data || []), ...(legacyContentsResult.data || [])].forEach((content: { id: string; category?: string | null; tags?: string[] | null }) => {
    if (content.category) {
      matchers.forEach((matcher) => {
        if (matchesCategoryValue(matcher.slug, content.category!)) {
          contentIdsByCategory.get(matcher.slug)?.add(content.id)
        }
      })
    }

    const tags = Array.isArray(content.tags) ? content.tags : []

    tags.forEach((tag) => {
      matchers.forEach((matcher) => {
        if (matchesCategoryValue(matcher.slug, tag)) {
          contentIdsByCategory.get(matcher.slug)?.add(content.id)
        }
      })
    })
  })

  return contentIdsByCategory
}

function intersectContentIds(idGroups: string[][]): string[] {
  if (idGroups.length === 0) {
    return []
  }

  return idGroups.reduce<string[]>((intersection, ids, index) => {
    if (index === 0) {
      return ids
    }

    const idSet = new Set(ids)
    return intersection.filter((id) => idSet.has(id))
  }, [])
}

// 获取所有分类及其内容数量
export async function getCategories(): Promise<ExploreCategory[]> {
  const supabase = await createClient()
  const configuredCategories = await getContentCategories()
  const contentIdsByCategory = await getApprovedContentIdsByCategories(
    supabase,
    configuredCategories.map((category) => category.slug)
  )

  return configuredCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    postCount: contentIdsByCategory.get(category.slug)?.size || 0,
  }))
}

// 获取热门标签
export async function getPopularTags(limit: number = 20) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('name, slug, usage_count')
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('Failed to fetch popular tags:', error)
    return []
  }

  const tagColors: Record<string, string> = {
    AI: 'hsl(262 83% 58%)',
    React: 'hsl(199 89% 48%)',
    'Next.js': 'hsl(221 83% 53%)',
    TypeScript: 'hsl(210 100% 56%)',
    前端开发: 'hsl(340 82% 52%)',
    后端开发: 'hsl(152 69% 40%)',
    数据库: 'hsl(24 95% 53%)',
    架构设计: 'hsl(280 68% 55%)',
    性能优化: 'hsl(38 92% 50%)',
    最佳实践: 'hsl(142 71% 45%)',
  }

  return data.map((tag) => ({
    name: tag.name,
    count: tag.usage_count,
    color: tagColors[tag.name] || 'hsl(221 83% 53%)',
  }))
}

// 探索页面内容查询
export async function getExploreContents(params: ExploreParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 20, category, tag, search } = params

  const filterIdGroups: string[][] = []

  if (category) {
    const categoryContentIds = Array.from(
      (await getApprovedContentIdsByCategories(supabase, [category])).get(category) || []
    )

    filterIdGroups.push(categoryContentIds)
  }

  if (tag) {
    filterIdGroups.push(await getApprovedContentIdsForTagValues(supabase, [tag]))
  }

  const filteredContentIds = filterIdGroups.length > 0 ? intersectContentIds(filterIdGroups) : []

  if (filterIdGroups.length > 0 && filteredContentIds.length === 0) {
    return { contents: [], totalPages: 0, total: 0, page, limit }
  }

  let query = supabase
    .from('contents')
    .select(
      `
      *,
      users:author_id (
        id,
        username,
        avatar,
        full_name
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'approved')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filteredContentIds.length > 0) {
    query = query.in('id', filteredContentIds)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    logger.error('Failed to fetch explore contents:', error)
    return { contents: [], totalPages: 0, total: 0 }
  }

  return {
    contents: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
