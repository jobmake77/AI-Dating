'use server'
import { logger } from '@/lib/utils/logger'
import { normalizeSingleRelation } from '@/lib/utils/normalize'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

// Validation schemas
const contentIdSchema = z.string().uuid('无效的内容ID')
const limitSchema = z.number().int('限制数量必须是整数').min(1, '限制数量必须大于0').max(50, '限制数量不能超过50')

// 获取相关内容推荐（基于标签）
export async function getRelatedContents(contentId: string, limit: number = 5) {
  // Validate input
  const contentIdValidation = contentIdSchema.safeParse(contentId)
  if (!contentIdValidation.success) {
    logger.error('Invalid contentId:', contentIdValidation.error)
    return []
  }

  const limitValidation = limitSchema.safeParse(limit)
  if (!limitValidation.success) {
    logger.error('Invalid limit:', limitValidation.error)
    return []
  }

  try {
    const supabase = await createClient()

    // 获取当前内容的标签
    const { data: currentContent } = await supabase
      .from('contents')
      .select('tags')
      .eq('id', contentId)
      .single()

    if (!currentContent || !currentContent.tags || currentContent.tags.length === 0) {
      return []
    }

    // 查找有相同标签的内容
    const { data, error } = await supabase
      .from('contents')
      .select(`
        id,
        title,
        excerpt,
        cover_image,
        tags,
        view_count,
        likes_count,
        created_at,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      `)
      .eq('status', 'approved')
      .neq('id', contentId)
      .overlaps('tags', currentContent.tags)
      .order('created_at', { ascending: false })
      .limit(limit * 2) // 获取更多，然后按相关度排序

    if (error) {
      logger.error('Get related contents error:', error)
      return []
    }

    // 计算相关度分数并排序
    const scoredContents = (data || []).map(content => {
      let score = 0

      // 相同标签数量
      const commonTags = content.tags?.filter((tag: string) =>
        currentContent.tags?.includes(tag)
      ).length || 0
      score += commonTags * 10

      // 热度加成（浏览量和点赞数）
      score += Math.log(content.view_count + 1) * 0.5
      score += Math.log(content.likes_count + 1) * 1

      return { ...content, score }
    })

    // 按分数排序并返回前 N 个
    return scoredContents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    logger.error('Get related contents error:', error)
    return []
  }
}

// 获取热门内容
export async function getTrendingContents(params: {
  timeRange?: 'day' | 'week' | 'month' | 'all'
  limit?: number
} = {}) {
  const { timeRange = 'week', limit = 10 } = params

  try {
    const supabase = await createClient()

    // 计算时间范围
    const now = new Date()
    let startDate: Date | null = null

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = null
        break
    }

    let query = supabase
      .from('contents')
      .select(`
        id,
        title,
        excerpt,
        cover_image,
        tags,
        view_count,
        likes_count,
        comments_count,
        reposts_count,
        created_at,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      `)
      .eq('status', 'approved')

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data, error } = await query.limit(limit * 2)

    if (error) {
      logger.error('Get trending contents error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return []
    }

    // 计算热度分数
    const scoredContents = (data || []).map(content => {
      let score = 0

      // 处理 Supabase 嵌套查询返回的数组
      const normalizedContent = {
        ...content,
        users: normalizeSingleRelation(content.users)
      }

      // 浏览量权重
      score += content.view_count * 1

      // 点赞数权重（更高）
      score += content.likes_count * 5

      // 评论数权重
      score += content.comments_count * 3

      // 转发数权重
      score += content.reposts_count * 4

      // 时间衰减（越新的内容分数越高）
      const ageInDays = (now.getTime() - new Date(content.created_at).getTime()) / (24 * 60 * 60 * 1000)
      const timeDecay = Math.exp(-ageInDays / 7) // 7天半衰期
      score *= timeDecay

      return { ...normalizedContent, score }
    })

    // 按分数排序并返回前 N 个
    return scoredContents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    logger.error('Get trending contents error:', error)
    // 发生任何错误时返回空数组，让 UI 优雅降级
    return []
  }
}

// 获取推荐内容（个性化推荐）
export async function getRecommendedContents(limit: number = 10) {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // 未登录用户返回热门内容
      return getTrendingContents({ limit })
    }

    // 获取用户最近浏览/点赞的内容的标签
    const { data: userLikes } = await supabase
      .from('likes')
      .select('contents(tags)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // 收集用户感兴趣的标签
    const interestedTags = new Set<string>()
    userLikes?.forEach(like => {
      const tags = (like as any).contents?.tags || []
      tags.forEach((tag: string) => interestedTags.add(tag))
    })

    if (interestedTags.size === 0) {
      // 没有足够的数据，返回热门内容
      return getTrendingContents({ limit })
    }

    // 查找包含这些标签的内容
    const { data, error } = await supabase
      .from('contents')
      .select(`
        id,
        title,
        excerpt,
        cover_image,
        tags,
        view_count,
        likes_count,
        created_at,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      `)
      .eq('status', 'approved')
      .overlaps('tags', Array.from(interestedTags))
      .order('created_at', { ascending: false })
      .limit(limit * 2)

    if (error) {
      logger.error('Get recommended contents error:', error)
      return getTrendingContents({ limit })
    }

    // 计算推荐分数
    const scoredContents = (data || []).map(content => {
      let score = 0

      // 标签匹配度
      const matchedTags = content.tags?.filter((tag: string) =>
        interestedTags.has(tag)
      ).length || 0
      score += matchedTags * 10

      // 热度加成
      score += Math.log(content.view_count + 1) * 0.5
      score += Math.log(content.likes_count + 1) * 1

      // 新鲜度加成
      const ageInDays = (Date.now() - new Date(content.created_at).getTime()) / (24 * 60 * 60 * 1000)
      if (ageInDays < 7) {
        score += (7 - ageInDays) * 0.5
      }

      return { ...content, score }
    })

    // 按分数排序并返回前 N 个
    return scoredContents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    logger.error('Get recommended contents error:', error)
    // 发生错误时降级到热门内容
    return getTrendingContents({ limit })
  }
}
