import { createClient } from '@/lib/supabase/server'

/**
 * 数据库查询优化工具
 * 提供批量查询、缓存和性能监控功能
 */

// =====================================================
// 批量查询优化
// =====================================================

/**
 * 批量获取用户信息（避免 N+1 查询）
 */
export async function batchGetUsers(userIds: string[]) {
  if (userIds.length === 0) return []

  const supabase = await createClient()
  const uniqueIds = [...new Set(userIds)]

  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, avatar, bio')
    .in('id', uniqueIds)

  if (error) {
    console.error('批量获取用户失败:', error)
    return []
  }

  return data || []
}

/**
 * 批量获取内容信息
 */
export async function batchGetContents(contentIds: string[]) {
  if (contentIds.length === 0) return []

  const supabase = await createClient()
  const uniqueIds = [...new Set(contentIds)]

  const { data, error } = await supabase
    .from('contents')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image,
      author_id,
      likes_count,
      comments_count,
      views,
      created_at
    `)
    .in('id', uniqueIds)
    .eq('status', 'approved')

  if (error) {
    console.error('批量获取内容失败:', error)
    return []
  }

  return data || []
}

/**
 * 批量检查用户点赞状态
 */
export async function batchCheckUserLikes(userId: string, contentIds: string[]) {
  if (contentIds.length === 0) return new Set<string>()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('likes')
    .select('content_id')
    .eq('user_id', userId)
    .in('content_id', contentIds)

  if (error) {
    console.error('批量检查点赞状态失败:', error)
    return new Set<string>()
  }

  return new Set(data?.map(like => like.content_id) || [])
}

/**
 * 批量检查用户关注状态
 */
export async function batchCheckUserFollows(userId: string, targetUserIds: string[]) {
  if (targetUserIds.length === 0) return new Set<string>()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
    .in('following_id', targetUserIds)

  if (error) {
    console.error('批量检查关注状态失败:', error)
    return new Set<string>()
  }

  return new Set(data?.map(follow => follow.following_id) || [])
}

// =====================================================
// 查询性能监控
// =====================================================

/**
 * 记录查询性能
 */
export async function logQueryPerformance(
  queryName: string,
  executionTimeMs: number,
  rowsReturned?: number,
  queryText?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.rpc('log_query_performance', {
    p_query_name: queryName,
    p_query_text: queryText || null,
    p_execution_time_ms: executionTimeMs,
    p_rows_returned: rowsReturned || null,
    p_user_id: user?.id || null,
  })
}

/**
 * 查询性能包装器
 */
export async function withPerformanceTracking<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await queryFn()
    const executionTime = performance.now() - startTime

    // 只记录慢查询（超过 500ms）
    if (executionTime > 500) {
      await logQueryPerformance(queryName, executionTime)
    }

    return result
  } catch (error) {
    const executionTime = performance.now() - startTime
    await logQueryPerformance(queryName, executionTime)
    throw error
  }
}

// =====================================================
// 优化的查询函数
// =====================================================

/**
 * 优化的内容列表查询（使用复合索引）
 */
export async function getOptimizedContentsList(options: {
  status?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'views' | 'likes_count'
}) {
  const supabase = await createClient()
  const { status = 'approved', limit = 20, offset = 0, orderBy = 'created_at' } = options

  return withPerformanceTracking('getOptimizedContentsList', async () => {
    const { data, error, count } = await supabase
      .from('contents')
      .select(`
        id,
        title,
        slug,
        excerpt,
        cover_image,
        tags,
        views,
        likes_count,
        comments_count,
        created_at,
        author_id
      `, { count: 'exact' })
      .eq('status', status)
      .order(orderBy, { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // 批量获取作者信息
    const authorIds = data?.map(content => content.author_id) || []
    const authors = await batchGetUsers(authorIds)
    const authorsMap = new Map(authors.map(author => [author.id, author]))

    // 组装数据
    const contentsWithAuthors = data?.map(content => ({
      ...content,
      author: authorsMap.get(content.author_id),
    }))

    return {
      data: contentsWithAuthors || [],
      count: count || 0,
    }
  })
}

/**
 * 优化的用户内容查询（使用复合索引）
 */
export async function getOptimizedUserContents(
  userId: string,
  options: {
    status?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()
  const { status = 'approved', limit = 20, offset = 0 } = options

  return withPerformanceTracking('getOptimizedUserContents', async () => {
    const { data, error, count } = await supabase
      .from('contents')
      .select('*', { count: 'exact' })
      .eq('author_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
    }
  })
}

/**
 * 优化的社区帖子查询（使用复合索引）
 */
export async function getOptimizedCommunityPosts(
  communityId: string,
  options: {
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()
  const { limit = 20, offset = 0 } = options

  return withPerformanceTracking('getOptimizedCommunityPosts', async () => {
    const { data, error, count } = await supabase
      .from('community_posts')
      .select(`
        id,
        title,
        content,
        images,
        is_pinned,
        is_locked,
        likes_count,
        comments_count,
        created_at,
        author_id
      `, { count: 'exact' })
      .eq('community_id', communityId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // 批量获取作者信息
    const authorIds = data?.map(post => post.author_id) || []
    const authors = await batchGetUsers(authorIds)
    const authorsMap = new Map(authors.map(author => [author.id, author]))

    // 组装数据
    const postsWithAuthors = data?.map(post => ({
      ...post,
      author: authorsMap.get(post.author_id),
    }))

    return {
      data: postsWithAuthors || [],
      count: count || 0,
    }
  })
}

/**
 * 优化的未读消息统计（使用索引）
 */
export async function getOptimizedUnreadCount(userId: string) {
  const supabase = await createClient()

  return withPerformanceTracking('getOptimizedUnreadCount', async () => {
    // 获取用户的所有会话及其 last_read_at
    const { data: conversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId)

    if (!conversations || conversations.length === 0) {
      return 0
    }

    // 使用单个查询统计所有未读消息
    const conversationIds = conversations.map(c => c.conversation_id)
    const lastReadMap = new Map(
      conversations.map(c => [c.conversation_id, c.last_read_at || '1970-01-01'])
    )

    let totalUnread = 0

    // 批量查询每个会话的未读消息数
    for (const convId of conversationIds) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .gt('created_at', lastReadMap.get(convId)!)
        .neq('sender_id', userId)

      totalUnread += count || 0
    }

    return totalUnread
  })
}

// =====================================================
// 归档数据查询
// =====================================================

/**
 * 查询归档内容
 */
export async function getArchivedContents(options: {
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const { limit = 20, offset = 0 } = options

  const { data, error, count } = await supabase
    .from('contents_archive')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('获取归档内容失败:', error)
    return { data: [], count: 0 }
  }

  return {
    data: data || [],
    count: count || 0,
  }
}

/**
 * 运行数据归档
 */
export async function runDataArchiving() {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('run_all_archiving')

  if (error) {
    console.error('运行数据归档失败:', error)
    return null
  }

  return data
}
