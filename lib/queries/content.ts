import { createClient } from '@/lib/supabase/server'

export interface ContentListParams {
  page?: number
  limit?: number
  tag?: string
  category?: string
  status?: 'approved' | 'pending' | 'rejected'
  authorId?: string
}

export interface FeedItem {
  id: string
  content_id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string | null
  category: string | null
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
  const { page = 1, limit = 12, tag, category, status = 'approved' } = params

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

  if (tag) {
    originalQuery = originalQuery.contains('tags', [tag])
  }

  if (category) {
    originalQuery = originalQuery.eq('category', category)
  }

  const { data: originalContents, error: originalError } = await originalQuery

  if (originalError) {
    throw new Error(`Failed to fetch original contents: ${originalError.message}`)
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
          id: `repost-${repost.id}`, // Use repost ID to make it unique
          content_id: repost.contents.id,
          is_repost: true,
          reposted_by: repost.users,
          reposted_at: repost.created_at,
        })
      }
    })
  }

  // 4. 按时间排序（原创用 created_at，转发用 reposted_at）
  feedItems.sort((a, b) => {
    const timeA = a.is_repost ? new Date(a.reposted_at!).getTime() : new Date(a.created_at).getTime()
    const timeB = b.is_repost ? new Date(b.reposted_at!).getTime() : new Date(b.created_at).getTime()
    return timeB - timeA
  })

  // 5. 分页
  const from = (page - 1) * limit
  const to = from + limit
  const paginatedItems = feedItems.slice(from, to)

  return {
    contents: paginatedItems,
    total: feedItems.length,
    page,
    limit,
    totalPages: Math.ceil(feedItems.length / limit),
  }
}

export async function getContents(params: ContentListParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12, tag, category, status = 'approved', authorId } = params

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
    .order('created_at', { ascending: false })

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (authorId) {
    query = query.eq('author_id', authorId)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(`Failed to fetch contents: ${error.message}`)
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
    .single()

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
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
    .single()

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
  }

  return data
}
