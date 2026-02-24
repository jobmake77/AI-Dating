import { createClient } from '@/lib/supabase/server'

// 获取用户的所有会话
export async function getUserConversations(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      last_read_at,
      conversations (
        id,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .order('conversations(updated_at)', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  // 获取每个会话的最后一条消息和对方用户信息
  const conversationsWithDetails = await Promise.all(
    (data || []).map(async (participant) => {
      const conversationId = participant.conversation_id

      // 获取最后一条消息
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // 获取对方用户信息
      const { data: otherParticipants } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          users (
            id,
            username,
            full_name,
            avatar
          )
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', userId)
        .single()

      // 提取用户对象（Supabase 返回的是嵌套对象）
      const otherUserData = otherParticipants?.users as any
      const otherUser = Array.isArray(otherUserData) ? otherUserData[0] : otherUserData

      // 计算未读消息数
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .gt('created_at', participant.last_read_at || '1970-01-01')
        .neq('sender_id', userId)

      // 处理 Supabase 嵌套查询返回的数组
      const conversations = participant.conversations as any
      const normalizedConversations = Array.isArray(conversations) ? conversations[0] : conversations

      return {
        id: conversationId,
        lastMessage,
        otherUser,
        unreadCount: unreadCount || 0,
        lastReadAt: participant.last_read_at,
        updatedAt: normalizedConversations?.updated_at,
      }
    })
  )

  return conversationsWithDetails
}

// 获取或创建与指定用户的会话
export async function getOrCreateConversation(userId: string, otherUserId: string) {
  const supabase = await createClient()

  // 查找是否已存在会话
  const { data: existingConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId)

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
        return conv.conversation_id
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
    throw new Error(`Failed to create conversation: ${conversationError.message}`)
  }

  // 添加参与者
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: newConversation.id, user_id: userId },
      { conversation_id: newConversation.id, user_id: otherUserId },
    ])

  if (participantsError) {
    throw new Error(`Failed to add participants: ${participantsError.message}`)
  }

  return newConversation.id
}

// 获取会话的所有消息（包含已读状态信息）
export async function getConversationMessages(conversationId: string, currentUserId: string, limit = 50) {
  const supabase = await createClient()

  // 获取消息
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        id,
        username,
        full_name,
        avatar
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`)
  }

  // 获取对方用户的 last_read_at
  const { data: otherParticipant } = await supabase
    .from('conversation_participants')
    .select('last_read_at')
    .eq('conversation_id', conversationId)
    .neq('user_id', currentUserId)
    .single()

  return {
    messages: messages || [],
    otherUserLastReadAt: otherParticipant?.last_read_at || null,
  }
}

// 获取会话的对方用户信息
export async function getConversationOtherUser(conversationId: string, currentUserId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      users (
        id,
        username,
        full_name,
        avatar
      )
    `)
    .eq('conversation_id', conversationId)
    .neq('user_id', currentUserId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch other user: ${error.message}`)
  }

  // Supabase 返回的 users 可能是数组或对象，需要处理
  const users = data?.users as any
  return Array.isArray(users) ? users[0] : users
}

// 获取未读消息数量
export async function getUnreadMessagesCount(userId: string) {
  const supabase = await createClient()

  // 获取用户参与的所有会话
  const { data: conversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

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
      .neq('sender_id', userId)

    totalUnread += count || 0
  }

  return totalUnread
}
