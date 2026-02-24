'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'like' | 'comment' | 'repost' | 'follow'

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: NotificationType
  content_id: string | null
  comment_id: string | null
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

// 创建通知
export async function createNotification(params: {
  userId: string
  actorId: string
  type: NotificationType
  contentId?: string
  commentId?: string
}) {
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
  })

  if (error) {
    console.error('Create notification error:', error)
    throw new Error('创建通知失败')
  }

  return { success: true }
}

// 获取用户的通知列表
export async function getNotifications(page: number = 1, limit: number = 20) {
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
    console.error('Get notifications error:', error)
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
    console.error('Get unread count error:', error)
    return 0
  }

  return count || 0
}

// 标记通知为已读
export async function markAsRead(notificationId: string) {
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
    console.error('Mark as read error:', error)
    throw new Error('标记已读失败')
  }

  revalidatePath('/notifications')
  return { success: true }
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
    console.error('Mark all as read error:', error)
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
    console.error('Delete notification error:', error)
    throw new Error('删除通知失败')
  }

  revalidatePath('/notifications')
  return { success: true }
}
