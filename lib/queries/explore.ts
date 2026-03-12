import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export interface ExploreParams {
  page?: number
  limit?: number
  category?: string
  tag?: string
  search?: string
}

// 分类到标签的映射（category column 已被移除，改用 tags 数组列查询）
const categoryTagMapping: Record<string, string[]> = {
  'source-code': ['源码解析', '源码', 'source-code'],
  'workshop': ['实战工坊', '最佳实践', 'workshop'],
  'architecture': ['架构设计', 'architecture'],
  'ai-frontier': ['AI', 'ai-frontier', 'AI 前沿'],
  'interview': ['面试宝典', 'interview', '面试'],
}

// 获取所有分类及其内容数量
export async function getCategories() {
  const supabase = await createClient()

  // 定义分类映射
  const categoryMap = [
    { id: "1", name: "源码解析", slug: "source-code", icon: "💻", description: "深入源码，理解原理" },
    { id: "2", name: "实战工坊", slug: "workshop", icon: "🛠️", description: "动手实践，学以致用" },
    { id: "3", name: "架构设计", slug: "architecture", icon: "🏗️", description: "系统设计，架构思维" },
    { id: "4", name: "AI 前沿", slug: "ai-frontier", icon: "🤖", description: "AI 技术，前沿探索" },
    { id: "5", name: "面试宝典", slug: "interview", icon: "📚", description: "面试经验，求职指南" },
  ]

  // 获取每个分类的内容数量（通过 tags 数组列查询，因为 category 列已被移除）
  const categoriesWithCount = await Promise.all(
    categoryMap.map(async (cat) => {
      const tagNames = categoryTagMapping[cat.slug] || [cat.slug]

      // Count contents that have any of the mapped tags using overlaps (&&)
      const { count, error } = await supabase
        .from('contents')
        .select('*', { count: 'exact', head: true })
        .overlaps('tags', tagNames)
        .eq('status', 'approved')
        .is('deleted_at', null)

      if (error) {
        logger.error(`Failed to count contents for category ${cat.slug}:`, error)
        return { ...cat, postCount: 0 }
      }

      return { ...cat, postCount: count || 0 }
    })
  )

  return categoriesWithCount
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

  // 为标签添加颜色
  const tagColors: Record<string, string> = {
    "AI": "hsl(262 83% 58%)",
    "React": "hsl(199 89% 48%)",
    "Next.js": "hsl(221 83% 53%)",
    "TypeScript": "hsl(210 100% 56%)",
    "前端开发": "hsl(340 82% 52%)",
    "后端开发": "hsl(152 69% 40%)",
    "数据库": "hsl(24 95% 53%)",
    "架构设计": "hsl(280 68% 55%)",
    "性能优化": "hsl(38 92% 50%)",
    "最佳实践": "hsl(142 71% 45%)",
  }

  return data.map((tag) => ({
    name: tag.name,
    count: tag.usage_count,
    color: tagColors[tag.name] || "hsl(221 83% 53%)",
  }))
}

// 探索页面内容查询
export async function getExploreContents(params: ExploreParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 20, category, tag, search } = params

  let query = supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar,
        full_name
      )
    `, { count: 'exact' })
    .eq('status', 'approved')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // 分类筛选（通过 tags 数组列，因为 category 列已被移除）
  if (category) {
    const tagNames = categoryTagMapping[category] || [category]
    query = query.overlaps('tags', tagNames)
  }

  // 标签筛选
  if (tag) {
    query = query.contains('tags', [tag])
  }

  // 搜索筛选
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
