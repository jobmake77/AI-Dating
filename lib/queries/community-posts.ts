import { createClient } from '@/lib/supabase/server'

// =====================================================
// Community Post Queries
// =====================================================

export async function getCommunityPosts(communityId: string, options?: {
  limit?: number
  offset?: number
  sortBy?: 'latest' | 'popular'
}) {
  const supabase = await createClient()
  const { limit = 20, offset = 0, sortBy = 'latest' } = options || {}

  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:users!community_posts_author_id_fkey(id, username, full_name, avatar),
      community:communities!community_posts_community_id_fkey(id, slug, name)
    `, { count: 'exact' })
    .eq('community_id', communityId)

  // 排序
  if (sortBy === 'popular') {
    query = query
      .order('is_pinned', { ascending: false })
      .order('likes_count', { ascending: false })
      .order('comments_count', { ascending: false })
  } else {
    query = query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('获取社区帖子列表失败:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export async function getCommunityPostById(postId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:users!community_posts_author_id_fkey(id, username, full_name, avatar, bio),
      community:communities!community_posts_community_id_fkey(id, slug, name, type)
    `)
    .eq('id', postId)
    .single()

  if (error) {
    console.error('获取帖子详情失败:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function getPostComments(postId: string, options?: {
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { limit = 50, offset = 0 } = options || {}

  const { data, error, count } = await supabase
    .from('community_post_comments')
    .select(`
      *,
      author:users!community_post_comments_author_id_fkey(id, username, full_name, avatar)
    `, { count: 'exact' })
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('获取评论列表失败:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export async function getUserPostLikeStatus(postId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('community_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (error) {
    // 用户未点赞
    return { liked: false, error: null }
  }

  return { liked: true, error: null }
}

export async function getUserPosts(userId: string, options?: {
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { limit = 20, offset = 0 } = options || {}

  const { data, error, count } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:users!community_posts_author_id_fkey(id, username, full_name, avatar),
      community:communities!community_posts_community_id_fkey(id, slug, name)
    `, { count: 'exact' })
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('获取用户帖子列表失败:', error)
    return { data: [], count: 0, error }
  }

  return { data: data || [], count: count || 0, error: null }
}

export async function getHotPosts(options?: {
  limit?: number
  timeRange?: 'day' | 'week' | 'month' | 'all'
}) {
  const supabase = await createClient()
  const { limit = 20, timeRange = 'week' } = options || {}

  let query = supabase
    .from('community_posts')
    .select(`
      *,
      author:users!community_posts_author_id_fkey(id, username, full_name, avatar),
      community:communities!community_posts_community_id_fkey(id, slug, name, type)
    `)

  // 时间范围筛选
  if (timeRange !== 'all') {
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    query = query.gte('created_at', startDate.toISOString())
  }

  // 只显示公开社区的帖子
  query = query
    .order('likes_count', { ascending: false })
    .order('comments_count', { ascending: false })
    .limit(limit)

  const { data, error } = await query

  if (error) {
    console.error('获取热门帖子失败:', error)
    return { data: [], error }
  }

  // 过滤出公开社区的帖子
  const publicPosts = data?.filter(post => post.community?.type === 'public') || []

  return { data: publicPosts, error: null }
}

export async function getLatestPosts(options?: {
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { limit = 20, offset = 0 } = options || {}

  const { data, error, count } = await supabase
    .from('community_posts')
    .select(`
      *,
      author:users!community_posts_author_id_fkey(id, username, full_name, avatar),
      community:communities!community_posts_community_id_fkey(id, slug, name, type)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('获取最新帖子失败:', error)
    return { data: [], count: 0, error }
  }

  // 过滤出公开社区的帖子
  const publicPosts = data?.filter(post => post.community?.type === 'public') || []

  return { data: publicPosts, count: count || 0, error: null }
}
