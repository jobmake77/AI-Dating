'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 发送消息
export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  if (!content.trim()) {
    return { error: '消息内容不能为空' }
  }

  // 验证用户是否是会话参与者
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participant) {
    return { error: '无权限发送消息' }
  }

  // 发送消息
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Send message error:', error)
    return { error: '发送失败，请重试' }
  }

  revalidatePath(`/messages/${conversationId}`)
  return { success: true, message: data }
}

// 标记会话为已读
export async function markConversationAsRead(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Mark as read error:', error)
    return { error: '操作失败' }
  }

  revalidatePath('/messages')
  return { success: true }
}

// 创建与指定用户的会话
export async function createConversationWithUser(otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '请先登录' }
  }

  if (user.id === otherUserId) {
    return { error: '不能与自己创建会话' }
  }

  // 检查对方用户是否存在
  const { data: otherUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', otherUserId)
    .single()

  if (!otherUser) {
    return { error: '用户不存在' }
  }

  // 查找是否已存在会话
  const { data: existingConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (existingConversations && existingConversations.length > 0) {
    // 检查这些会话中是否有包含 otherUserId 的
    for (const conv of existingConversations) {
      const { data: otherParticipant } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.conversation_id)
        .eq('user_id', otherUserId)
        .single()

      if (otherParticipant) {
        return { success: true, conversationId: conv.conversation_id }
      }
    }
  }

  // 创建新会话
  const { data: newConversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single()

  if (conversationError) {
    console.error('Create conversation error:', conversationError)
    return { error: '创建会话失败' }
  }

  // 添加参与者
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConversation.id, user_id: user.id },
      { conversation_id: newConversation.id, user_id: otherUserId },
    ])

  if (participantsError) {
    console.error('Add participants error:', participantsError)
    return { error: '添加参与者失败' }
  }

  revalidatePath('/messages')
  return { success: true, conversationId: newConversation.id }
}

// 获取未读消息数量
export async function getUnreadMessagesCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  // 获取用户参与的所有会话
  const { data: conversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', user.id)

  if (!conversations || conversations.length === 0) {
    return 0
  }

  // 计算所有会话的未读消息总数
  let totalUnread = 0

  for (const conv of conversations) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.conversation_id)
      .gt('created_at', conv.last_read_at || '1970-01-01')
      .neq('sender_id', user.id)

    totalUnread += count || 0
  }

  return totalUnread
}
