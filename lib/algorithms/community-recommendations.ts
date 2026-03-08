/**
 * 社区推荐算法
 * 基于用户兴趣标签、社区活跃度和热门度进行推荐
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export interface CommunityRecommendation {
  id: string
  slug: string
  name: string
  description: string | null
  icon_url: string | null
  cover_url: string | null
  type: 'public' | 'private'
  members_count: number
  posts_count: number
  created_at: string
  score: number
  reason: string
}

/**
 * 计算社区热度分数
 * 基于成员数、帖子数和活跃度
 */
function calculateHotScore(community: any): number {
  const membersWeight = 0.4
  const postsWeight = 0.6

  // 归一化处理（假设最大值）
  const maxMembers = 10000
  const maxPosts = 50000

  const membersScore = Math.min(community.members_count / maxMembers, 1) * membersWeight
  const postsScore = Math.min(community.posts_count / maxPosts, 1) * postsWeight

  return (membersScore + postsScore) * 100
}

/**
 * 获取用户兴趣标签
 * 基于用户发布的内容和参与的社区
 */
async function getUserInterestTags(userId: string): Promise<string[]> {
  const supabase = await createClient()

  // 获取用户发布内容的标签
  const { data: contents } = await supabase
    .from('contents')
    .select('tags')
    .eq('author_id', userId)
    .limit(50)

  const tags = new Set<string>()

  if (contents) {
    contents.forEach(content => {
      if (content.tags && Array.isArray(content.tags)) {
        content.tags.forEach(tag => tags.add(tag))
      }
    })
  }

  return Array.from(tags)
}

/**
 * 基于兴趣标签推荐社区
 * 返回与用户兴趣相关的社区
 */
export async function getInterestBasedRecommendations(
  userId: string,
  limit: number = 10
): Promise<CommunityRecommendation[]> {
  try {
    const supabase = await createClient()

    // 获取用户兴趣标签
    const userTags = await getUserInterestTags(userId)

    // 获取用户已加入的社区
    const { data: joinedCommunities } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', userId)

    const joinedIds = joinedCommunities?.map(c => c.community_id) || []

    // 获取公开社区（排除已加入的）
    let query = supabase
      .from('communities')
      .select('*')
      .eq('type', 'public')

    if (joinedIds.length > 0) {
      query = query.not('id', 'in', `(${joinedIds.join(',')})`)
    }

    const { data: communities, error } = await query.limit(50)

    if (error) {
      logger.error('获取社区推荐失败:', error)
      return []
    }

    if (!communities || communities.length === 0) {
      return []
    }

    // 计算推荐分数
    const recommendations: CommunityRecommendation[] = communities.map(community => {
      let score = calculateHotScore(community)
      let reason = '热门社区'

      // 如果社区名称或描述包含用户兴趣标签，提高分数
      if (userTags.length > 0) {
        const communityText = `${community.name} ${community.description || ''}`.toLowerCase()
        const matchedTags = userTags.filter(tag =>
          communityText.includes(tag.toLowerCase())
        )

        if (matchedTags.length > 0) {
          score += matchedTags.length * 20
          reason = `与你的兴趣相关: ${matchedTags.slice(0, 3).join(', ')}`
        }
      }

      return {
        ...community,
        score,
        reason
      }
    })

    // 按分数排序并返回
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    logger.error('获取兴趣推荐失败:', error)
    return []
  }
}

/**
 * 获取热门社区排行
 * 基于成员数和活跃度
 */
export async function getHotCommunities(
  limit: number = 10
): Promise<CommunityRecommendation[]> {
  try {
    const supabase = await createClient()

    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .eq('type', 'public')
      .order('members_count', { ascending: false })
      .order('posts_count', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('获取热门社区失败:', error)
      return []
    }

    if (!communities) {
      return []
    }

    return communities.map(community => ({
      ...community,
      score: calculateHotScore(community),
      reason: '热门社区'
    }))
  } catch (error) {
    logger.error('获取热门社区失败:', error)
    return []
  }
}

/**
 * 获取新建社区
 * 帮助新社区获得曝光
 */
export async function getNewCommunities(
  limit: number = 10
): Promise<CommunityRecommendation[]> {
  try {
    const supabase = await createClient()

    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .eq('type', 'public')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('获取新建社区失败:', error)
      return []
    }

    if (!communities) {
      return []
    }

    return communities.map(community => ({
      ...community,
      score: 50, // 固定分数
      reason: '新建社区'
    }))
  } catch (error) {
    logger.error('获取新建社区失败:', error)
    return []
  }
}

/**
 * 获取综合推荐
 * 混合多种推荐策略
 */
export async function getMixedRecommendations(
  userId: string | null,
  limit: number = 10
): Promise<CommunityRecommendation[]> {
  try {
    const recommendations: CommunityRecommendation[] = []

    if (userId) {
      // 如果用户已登录，获取基于兴趣的推荐
      const interestBased = await getInterestBasedRecommendations(userId, Math.ceil(limit * 0.6))
      recommendations.push(...interestBased)
    }

    // 获取热门社区
    const hot = await getHotCommunities(Math.ceil(limit * 0.3))
    recommendations.push(...hot)

    // 获取新建社区
    const newCommunities = await getNewCommunities(Math.ceil(limit * 0.1))
    recommendations.push(...newCommunities)

    // 去重并按分数排序
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(r => [r.id, r])).values()
    )

    return uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    logger.error('获取混合推荐失败:', error)
    return []
  }
}
