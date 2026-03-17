import { createClient } from '@/lib/supabase/server'
import { getContentCategories } from '@/lib/queries/content-categories'
import { logger } from '@/lib/utils/logger'
import { normalizeSingleRelation } from '@/lib/utils/normalize'
import { isValidUuid } from '@/lib/utils/is-valid-uuid'

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
  category?: string | null
  category_name?: string | null
  category_color?: string | null
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
  href?: string
  source_type?: 'content' | 'repost'
  community?: {
    id: string
    slug: string
    name: string
  } | null
  is_repost: boolean
  is_pinned?: boolean
  is_hot?: boolean
  reposted_by?: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
  }
  reposted_at?: string
}

type FeedUser = FeedItem['users']
type CategoryMeta = {
  name: string
  color: string
}
type FeedContentRow = Omit<FeedItem, 'content_id' | 'is_repost' | 'reposted_by' | 'reposted_at'> & {
  users: FeedUser | FeedUser[] | null
}
type RepostRow = {
  id: string
  created_at: string
  contents: FeedContentRow | FeedContentRow[] | null
  users: FeedUser | FeedUser[] | null
}
type LikeWithContent = {
  contents: FeedContentRow | FeedContentRow[] | null
}
type RepostWithContent = {
  contents: FeedContentRow | FeedContentRow[] | null
}

const FEED_CANDIDATE_MULTIPLIER = 4
const FEED_MAX_CANDIDATES = 120

async function getCategoryMetaMap() {
  const categories = await getContentCategories({ includeInactive: true })
  return new Map<string, CategoryMeta>(
    categories.map((category) => [
      category.slug,
      {
        name: category.name,
        color: category.color,
      },
    ])
  )
}

function getFeedCandidateWindow(page: number, limit: number) {
  return Math.min(Math.max(page * limit * FEED_CANDIDATE_MULTIPLIER, limit * 2), FEED_MAX_CANDIDATES)
}

function buildFeedScore(item: Pick<FeedItem, 'likes_count' | 'comments_count' | 'view_count'>) {
  return (item.likes_count || 0) * 3 + (item.comments_count || 0) * 2 + (item.view_count || 0) * 0.1
}

function buildContentsBaseQuery(supabase: Awaited<ReturnType<typeof createClient>>, status: ContentListParams['status']) {
  return supabase
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
    .eq('status', status || 'approved')
    .is('deleted_at', null)
}

function buildRepostsBaseQuery(supabase: Awaited<ReturnType<typeof createClient>>, status: ContentListParams['status']) {
  return supabase
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
    `, { count: 'exact' })
    .eq('contents.status', status || 'approved')
}

async function getFollowingIds(supabase: Awaited<ReturnType<typeof createClient>>, userId?: string) {
  if (!userId) {
    return []
  }

  const { data } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  return data?.map((item) => item.following_id) || []
}

// 获取包含转发的内容时间线
export async function getContentsFeed(params: ContentListParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12, tag, status = 'approved', sortBy = 'hot' } = params
  const categoryMetaMap = await getCategoryMetaMap()
  const candidateWindow = getFeedCandidateWindow(page, limit)

  // Get current user for following filter
  const { data: { user } } = await supabase.auth.getUser()
  const followingIds = sortBy === 'following' ? await getFollowingIds(supabase, user?.id) : []

  if (sortBy === 'following' && followingIds.length === 0) {
    return {
      contents: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  // 1. 获取原创内容候选集
  let originalQuery = buildContentsBaseQuery(supabase, status)

  if (tag) {
    originalQuery = originalQuery.contains('tags', [tag])
  }

  if (sortBy === 'following') {
    originalQuery = originalQuery.in('author_id', followingIds)
  }

  if (sortBy === 'latest' || sortBy === 'following') {
    originalQuery = originalQuery.order('created_at', { ascending: false })
  } else {
    originalQuery = originalQuery
      .order('likes_count', { ascending: false })
      .order('comments_count', { ascending: false })
      .order('views', { ascending: false })
      .order('created_at', { ascending: false })
  }

  originalQuery = originalQuery.range(0, candidateWindow - 1)

  let repostsQuery = buildRepostsBaseQuery(supabase, status)
  if (sortBy === 'following') {
    repostsQuery = repostsQuery.in('user_id', followingIds)
  }
  repostsQuery = repostsQuery.order('created_at', { ascending: false }).range(0, candidateWindow - 1)

  const [
    { data: originalContents, error: originalError, count: originalCount },
    { data: reposts, error: repostsError, count: repostsCount },
  ] = await Promise.all([
    originalQuery,
    repostsQuery,
  ])

  if (originalError) {
    logger.error('Failed to fetch original contents:', originalError)
    return {
      contents: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  if (repostsError) {
    logger.error('Failed to fetch reposts:', repostsError)
  }

  // 3. 合并数据
  const feedItems: FeedItem[] = []

  // 添加原创内容
  if (originalContents) {
    originalContents.forEach((content: FeedContentRow) => {
      const normalizedUser = normalizeSingleRelation(content.users)
      if (!normalizedUser) return

      feedItems.push({
        ...content,
        users: normalizedUser,
        content_id: content.id,
        category_name: content.category ? categoryMetaMap.get(content.category)?.name || content.category : null,
        category_color: content.category ? categoryMetaMap.get(content.category)?.color || null : null,
        is_repost: false,
      })
    })
  }

  // 添加转发内容
  if (reposts) {
    reposts.forEach((repost: RepostRow) => {
      const repostedContent = normalizeSingleRelation(repost.contents)
      const repostedBy = normalizeSingleRelation(repost.users)
      const repostedContentUser = repostedContent
        ? normalizeSingleRelation(repostedContent.users)
        : null

      if (repostedContent && repostedBy && repostedContentUser) {
        feedItems.push({
          ...repostedContent,
          users: repostedContentUser,
          id: `repost-${repost.id}`, // Use repost ID to make it unique
          content_id: repostedContent.id,
          category_name: repostedContent.category ? categoryMetaMap.get(repostedContent.category)?.name || repostedContent.category : null,
          category_color: repostedContent.category ? categoryMetaMap.get(repostedContent.category)?.color || null : null,
          is_repost: true,
          reposted_by: repostedBy,
          reposted_at: repost.created_at,
        })
      }
    })
  }

  // 4. Filter by following if needed
  let filteredItems = feedItems
  if (sortBy === 'following' && user) {
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
      const scoreA = buildFeedScore(a)
      const scoreB = buildFeedScore(b)
      return scoreB - scoreA
    }
  })

  // 6. 分页
  const from = (page - 1) * limit
  const to = from + limit
  const paginatedItems = filteredItems.slice(from, to)

  return {
    contents: paginatedItems,
    total: (originalCount || 0) + (repostsCount || 0),
    page,
    limit,
    totalPages: Math.ceil(((originalCount || 0) + (repostsCount || 0)) / limit),
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
  if (!isValidUuid(id)) {
    return null
  }

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

  if (!data) {
    return null
  }

  const categoryMetaMap = await getCategoryMetaMap()
  const categoryMeta = data.category ? categoryMetaMap.get(data.category) : null

  return {
    ...data,
    category_name: categoryMeta?.name || data.category || null,
    category_color: categoryMeta?.color || null,
  }
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

  if (!data) {
    return null
  }

  const categoryMetaMap = await getCategoryMetaMap()
  const categoryMeta = data.category ? categoryMetaMap.get(data.category) : null

  return {
    ...data,
    category_name: categoryMeta?.name || data.category || null,
    category_color: categoryMeta?.color || null,
  }
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
  const contents = data
    ?.map((like: LikeWithContent) => normalizeSingleRelation(like.contents))
    .filter((content): content is FeedContentRow => Boolean(content)) || []

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
  const contents = data
    ?.map((repost: RepostWithContent) => normalizeSingleRelation(repost.contents))
    .filter((content): content is FeedContentRow => Boolean(content)) || []

  return {
    contents,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
