import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { normalizeSingleRelation } from '@/lib/utils/normalize'

export interface ContentListParams {
  page?: number
  limit?: number
  tag?: string
  status?: 'approved' | 'pending' | 'rejected'
  authorId?: string
  sortBy?: 'hot' | 'latest' | 'following'
}

export interface FeedItem {
  id: string
  content_id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string | null
  tags: string[] | null
  price_type: string
  status: string
  reject_reason: string | null
  views: number
  view_count: number
  likes_count: number
  comments_count: number
  reposts_count: number
  reading_time: number
  created_at: string
  updated_at: string
  author_id: string
  users: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
  }
  is_repost: boolean
  reposted_by?: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
  }
  reposted_at?: string
}

// 获取包含转发的内容时间线
export async function getContentsFeed(params: ContentListParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12, tag, status = 'approved', sortBy = 'hot' } = params

  // Get current user for following filter
  const { data: { user } } = await supabase.auth.getUser()

  // 1. 获取原创内容
  let originalQuery = supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar,
        full_name
      )
    `)
    .eq('status', status)
    .is('deleted_at', null)  // Exclude soft-deleted records

  if (tag) {
    originalQuery = originalQuery.contains('tags', [tag])
  }

  const { data: originalContents, error: originalError } = await originalQuery

  if (originalError) {
    logger.error('Failed to fetch original contents:', originalError)
    // 返回空数据而不是抛出错误
    return {
      contents: [],
      totalPages: 0,
    }
  }

  // 2. 获取转发内容
  const { data: reposts, error: repostsError } = await supabase
    .from('reposts')
    .select(`
      id,
      content_id,
      user_id,
      created_at,
      contents (
        *,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      ),
      users (
        id,
        username,
        avatar,
        full_name
      )
    `)
    .eq('contents.status', status)

  if (repostsError) {
    console.error('Failed to fetch reposts:', repostsError)
  }

  // 3. 合并数据
  const feedItems: FeedItem[] = []

  // 添加原创内容
  if (originalContents) {
    originalContents.forEach((content: any) => {
      feedItems.push({
        ...content,
        users: normalizeSingleRelation(content.users),
        content_id: content.id,
        is_repost: false,
      })
    })
  }

  // 添加转发内容
  if (reposts) {
    reposts.forEach((repost: any) => {
      if (repost.contents) {
        feedItems.push({
          ...repost.contents,
          users: normalizeSingleRelation(repost.contents.users),
          id: `repost-${repost.id}`, // Use repost ID to make it unique
          content_id: repost.contents.id,
          is_repost: true,
          reposted_by: normalizeSingleRelation(repost.users),
          reposted_at: repost.created_at,
        })
      }
    })
  }

  // 4. Filter by following if needed
  let filteredItems = feedItems
  if (sortBy === 'following' && user) {
    // Get user's following list
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = following?.map(f => f.following_id) || []
    filteredItems = feedItems.filter(item =>
      followingIds.includes(item.author_id) ||
      (item.is_repost && item.reposted_by && followingIds.includes(item.reposted_by.id))
    )
  }

  // 5. Sort based on sortBy parameter
  filteredItems.sort((a, b) => {
    if (sortBy === 'latest') {
      // Sort by time (newest first)
      const timeA = a.is_repost ? new Date(a.reposted_at!).getTime() : new Date(a.created_at).getTime()
      const timeB = b.is_repost ? new Date(b.reposted_at!).getTime() : new Date(b.created_at).getTime()
      return timeB - timeA
    } else {
      // Sort by hot (likes + comments + views)
      const scoreA = (a.likes_count || 0) * 3 + (a.comments_count || 0) * 2 + (a.view_count || 0) * 0.1
      const scoreB = (b.likes_count || 0) * 3 + (b.comments_count || 0) * 2 + (b.view_count || 0) * 0.1
      return scoreB - scoreA
    }
  })

  // 6. 分页
  const from = (page - 1) * limit
  const to = from + limit
  const paginatedItems = filteredItems.slice(from, to)

  return {
    contents: paginatedItems,
    total: filteredItems.length,
    page,
    limit,
    totalPages: Math.ceil(filteredItems.length / limit),
  }
}

export async function getContents(params: ContentListParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12, tag, status = 'approved', authorId } = params

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
    .eq('status', status)
    .is('deleted_at', null)  // Exclude soft-deleted records
    .order('created_at', { ascending: false })

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (authorId) {
    query = query.eq('author_id', authorId)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    logger.error("Failed to fetch contents:", error)
    return { contents: [], totalPages: 0 }
  }

  return {
    contents: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getContentById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar,
        full_name,
        bio
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)  // Exclude soft-deleted records
    .single()

  if (error) {
    logger.error("Failed to fetch content:", error)
    return null
  }

  return data
}

export async function getContentBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar,
        full_name,
        bio
      )
    `)
    .eq('slug', slug)
    .is('deleted_at', null)  // Exclude soft-deleted records
    .single()

  if (error) {
    logger.error("Failed to fetch content:", error)
    return null
  }

  return data
}

// 获取用户点赞的内容
export async function getUserLikedContents(userId: string, params: { page?: number; limit?: number } = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12 } = params

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('likes')
    .select(`
      id,
      created_at,
      contents (
        *,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('contents.status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    logger.error("Failed to fetch liked contents:", error)
    return { contents: [], totalPages: 0 }
  }

  // 提取内容数据
  const contents = data?.map((like: any) => like.contents).filter(Boolean) || []

  return {
    contents,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// 获取用户转发的内容
export async function getUserRepostedContents(userId: string, params: { page?: number; limit?: number } = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12 } = params

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('reposts')
    .select(`
      id,
      created_at,
      contents (
        *,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('contents.status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    logger.error("Failed to fetch reposted contents:", error)
    return { contents: [], totalPages: 0 }
  }

  // 提取内容数据
  const contents = data?.map((repost: any) => repost.contents).filter(Boolean) || []

  return {
    contents,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
