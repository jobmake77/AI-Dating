import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { logger } from '@/lib/utils/logger'

// =====================================================
// Community Queries
// =====================================================

export async function getCommunities(options?: {
  type?: 'public' | 'private' | 'all'
  limit?: number
  offset?: number
  search?: string
}) {
  const supabase = await createClient()
  const { type = 'all', limit = 20, offset = 0, search } = options || {}

  let query = supabase
    .from('communities')
    .select('*', { count: 'exact' })

  // 类型筛选
  if (type !== 'all') {
    query = query.eq('type', type)
  }

  // 搜索
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // 排序和分页
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    logger.warn('获取社区列表失败，返回空列表:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export const getCommunityBySlug = cache(async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: null }
    }

    logger.warn('获取社区详情失败，返回空结果:', {
      slug,
      error,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
    })
    return { data: null, error }
  }

  return { data, error: null }
})

export async function getUserCommunities(userId: string, options?: {
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { limit = 20, offset = 0 } = options || {}

  const { data, error, count } = await supabase
    .from('community_members')
    .select(`
      *,
      community:communities!community_members_community_id_fkey(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    logger.warn('获取用户社区列表失败，返回空列表:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export async function getCommunityMembers(communityId: string, options?: {
  role?: 'admin' | 'moderator' | 'member' | 'all'
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { role = 'all', limit = 50, offset = 0 } = options || {}

  let query = supabase
    .from('community_members')
    .select(`
      *,
      user:users!community_members_user_id_fkey(id, username, full_name, avatar, bio)
    `, { count: 'exact' })
    .eq('community_id', communityId)

  // 角色筛选
  if (role !== 'all') {
    query = query.eq('role', role)
  }

  // 排序：管理员 > 版主 > 成员，然后按加入时间
  query = query
    .order('role', { ascending: true })
    .order('joined_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    logger.warn('获取社区成员列表失败，返回空列表:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export async function getUserMembershipStatus(communityId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('community_members')
    .select('id, role, joined_at')
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .single()

  if (error) {
    // 用户不是成员
    return { data: null, error: null }
  }

  return { data, error: null }
}

export async function getTrendingCommunities(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('type', 'public')
    .order('members_count', { ascending: false })
    .order('posts_count', { ascending: false })
    .limit(limit)

  if (error) {
    logger.warn('获取热门社区失败，返回空列表:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function getRecommendedCommunities(userId: string, limit: number = 10) {
  const supabase = await createClient()

  // 获取用户已加入的社区
  const { data: joinedCommunities } = await supabase
    .from('community_members')
    .select('community_id')
    .eq('user_id', userId)

  const joinedIds = joinedCommunities?.map(m => m.community_id) || []

  // 推荐用户未加入的公开社区
  let query = supabase
    .from('communities')
    .select('*')
    .eq('type', 'public')

  if (joinedIds.length > 0) {
    query = query.not('id', 'in', `(${joinedIds.join(',')})`)
  }

  const { data, error } = await query
    .order('members_count', { ascending: false })
    .limit(limit)

  if (error) {
    logger.warn('获取推荐社区失败，返回空列表:', error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}
