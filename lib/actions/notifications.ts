'use server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'like' | 'comment' | 'repost' | 'follow' | 'event_reminder' | 'community_invite'

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: NotificationType
  content_id: string | null
  comment_id: string | null
  event_id: string | null
  community_id: string | null
  is_read: boolean
  created_at: string
  actor: {
    id: string
    username: string
    avatar: string | null
    full_name: string | null
  }
  content?: {
    id: string
    title: string
  }
}

// Validation schemas
const notificationTypeSchema = z.enum(['like', 'comment', 'repost', 'follow', 'event_reminder', 'community_invite'])

const createNotificationSchema = z.object({
  userId: z.string().uuid('无效的用户ID'),
  actorId: z.string().uuid('无效的操作者ID'),
  type: notificationTypeSchema,
  contentId: z.string().uuid('无效的内容ID').optional(),
  commentId: z.string().uuid('无效的评论ID').optional(),
  eventId: z.string().uuid('无效的活动ID').optional(),
  communityId: z.string().uuid('无效的社区ID').optional(),
})

const notificationIdSchema = z.string().uuid('无效的通知ID')

// 创建通知
export async function createNotification(params: {
  userId: string
  actorId: string
  type: NotificationType
  contentId?: string
  commentId?: string
  eventId?: string
  communityId?: string
}) {
  // Validate input
  const validation = createNotificationSchema.safeParse(params)
  if (!validation.success) {
    logger.warn('Invalid notification params:', validation.error.issues[0].message)
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  // 不给自己发通知
  if (params.userId === params.actorId) {
    return { success: true }
  }

  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    actor_id: params.actorId,
    type: params.type,
    content_id: params.contentId || null,
    comment_id: params.commentId || null,
    event_id: params.eventId || null,
    community_id: params.communityId || null,
  })

  if (error) {
    logger.error('Create notification error:', error)
    throw new Error('创建通知失败')
  }

  return { success: true }
}

// 创建活动提醒通知
export async function createEventReminder(eventId: string, userId: string) {
  // Validate input
  const eventValidation = notificationIdSchema.safeParse(eventId)
  const userValidation = notificationIdSchema.safeParse(userId)

  if (!eventValidation.success) {
    return { success: false, error: eventValidation.error.issues[0].message }
  }
  if (!userValidation.success) {
    return { success: false, error: userValidation.error.issues[0].message }
  }

  const supabase = await createClient()

  // 获取活动信息
  const { data: event } = await supabase
    .from('events')
    .select('creator_id')
    .eq('id', eventId)
    .single()

  if (!event) {
    return { success: false, error: '活动不存在' }
  }

  return createNotification({
    userId,
    actorId: event.creator_id,
    type: 'event_reminder',
    eventId,
  })
}

// 获取用户的通知列表
export async function getNotifications(page: number = 1, limit: number = 20) {
  // Validate input
  if (page < 1 || limit < 1 || limit > 100) {
    throw new Error('无效的分页参数')
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('未登录')
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:actor_id (
        id,
        username,
        avatar,
        full_name
      ),
      content:content_id (
        id,
        title
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    logger.error('Get notifications error:', error)
    throw new Error('获取通知失败')
  }

  return {
    notifications: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// 获取未读通知数量
export async function getUnreadCount() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return 0
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    logger.error('Get unread count error:', error)
    return 0
  }

  return count || 0
}

// 标记通知为已读
export async function markAsRead(notificationId: string) {
  // Validate input
  const validation = notificationIdSchema.safeParse(notificationId)
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('未登录')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    logger.error('Mark as read error:', error)
    throw new Error('标记已读失败')
  }

  revalidatePath('/notifications')
  return { success: true }
}

// 标记所有通知为已读（不触发 revalidate，供 Server Component 渲染时调用）
export async function markAllAsReadSilent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
}

// 标记所有通知为已读
export async function markAllAsRead() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('未登录')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    logger.error('Mark all as read error:', error)
    throw new Error('标记全部已读失败')
  }

  revalidatePath('/notifications')
}

// 删除通知
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('未登录')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    logger.error('Delete notification error:', error)
    throw new Error('删除通知失败')
  }

  revalidatePath('/notifications')
  return { success: true }
}
