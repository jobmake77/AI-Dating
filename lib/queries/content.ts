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
  source_type?: 'content' | 'repost' | 'community_post'
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
type CommunityRelation = {
  id: string
  slug: string
  name: string
  type?: string
}
type CommunityPostRow = {
  id: string
  title: string | null
  content: string
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  author_id: string
  author: FeedUser | FeedUser[] | null
  community: CommunityRelation | CommunityRelation[] | null
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractCommunityPostTitle(post: CommunityPostRow) {
  if (post.title?.trim()) {
    return post.title.trim()
  }

  const text = stripHtml(post.content)
  return text.slice(0, 50) + (text.length > 50 ? '...' : '')
}

function extractCommunityPostExcerpt(post: CommunityPostRow) {
  const text = stripHtml(post.content)
  return text.slice(0, 200) + (text.length > 200 ? '...' : '')
}

function calculateReadingTime(text: string) {
  return Math.max(1, Math.ceil(stripHtml(text).length / 300))
}

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

// 获取包含转发的内容时间线
export async function getContentsFeed(params: ContentListParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12, tag, status = 'approved', sortBy = 'hot' } = params
  const categoryMetaMap = await getCategoryMetaMap()

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

  const [repostsResult, communityPostsResult] = await Promise.all([
    supabase
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
      .eq('contents.status', status),
    supabase
      .from('community_posts')
      .select(`
        id,
        title,
        content,
        likes_count,
        comments_count,
        is_pinned,
        created_at,
        updated_at,
        author_id,
        author:users!community_posts_author_id_fkey(
          id,
          username,
          avatar,
          full_name
        ),
        community:communities!community_posts_community_id_fkey(
          id,
          slug,
          name,
          type
        )
      `),
  ])

  const { data: reposts, error: repostsError } = repostsResult
  const { data: communityPosts, error: communityPostsError } = communityPostsResult

  if (repostsError) {
    console.error('Failed to fetch reposts:', repostsError)
  }

  if (communityPostsError) {
    logger.error('Failed to fetch community posts for feed:', communityPostsError)
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

  if (communityPosts) {
    communityPosts.forEach((post: CommunityPostRow) => {
      const author = normalizeSingleRelation(post.author)
      const community = normalizeSingleRelation(post.community)

      if (!author || !community || community.type !== 'public') {
        return
      }

      feedItems.push({
        id: post.id,
        content_id: post.id,
        title: extractCommunityPostTitle(post),
        slug: `${community.slug}-${post.id}`,
        content: post.content,
        excerpt: extractCommunityPostExcerpt(post),
        cover_image: null,
        tags: ['社区帖子'],
        category: null,
        category_name: null,
        category_color: null,
        price_type: 'free',
        status: 'approved',
        reject_reason: null,
        views: 0,
        view_count: 0,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        reposts_count: 0,
        reading_time: calculateReadingTime(post.content),
        created_at: post.created_at,
        updated_at: post.updated_at,
        author_id: post.author_id,
        users: author,
        href: `/communities/${community.slug}/posts/${post.id}`,
        source_type: 'community_post',
        community: {
          id: community.id,
          slug: community.slug,
          name: community.name,
        },
        is_repost: false,
        is_pinned: post.is_pinned,
      })
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
