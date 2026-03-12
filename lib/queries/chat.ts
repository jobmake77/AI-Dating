import { createClient } from '@/lib/supabase/server'
import { normalizeSingleRelation } from '@/lib/utils/normalize'

// 获取用户的所有会话（优化版 - 消除 N+1 查询）
export async function getUserConversations(userId: string) {
  const supabase = await createClient()

  // 第一步：获取用户参与的所有会话 ID 和 last_read_at
  const { data: participantData, error: participantError } = await supabase
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

  if (participantError) {
    throw new Error(`Failed to fetch conversations: ${participantError.message}`)
  }

  if (!participantData || participantData.length === 0) {
    return []
  }

  const conversationIds = participantData.map(p => p.conversation_id)

  // 第二步：批量获取所有会话的最后一条消息
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })

  // 为每个会话找到最后一条消息
  const lastMessageMap = new Map()
  lastMessages?.forEach(msg => {
    if (!lastMessageMap.has(msg.conversation_id)) {
      lastMessageMap.set(msg.conversation_id, msg)
    }
  })

  // 第三步：批量获取所有对方用户信息
  const { data: allParticipants } = await supabase
    .from('conversation_participants')
    .select(`
      conversation_id,
      user_id,
      users (
        id,
        username,
        full_name,
        avatar
      )
    `)
    .in('conversation_id', conversationIds)
    .neq('user_id', userId)

  // 创建会话 ID 到对方用户的映射
  const otherUserMap = new Map()
  allParticipants?.forEach(participant => {
    const userData = normalizeSingleRelation(participant.users)
    if (userData) {
      otherUserMap.set(participant.conversation_id, userData)
    }
  })

  // 第四步：批量计算未读消息数
  const unreadCountsPromises = participantData.map(async (participant) => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', participant.conversation_id)
      .gt('created_at', participant.last_read_at || '1970-01-01')
      .neq('sender_id', userId)

    return {
      conversationId: participant.conversation_id,
      unreadCount: count || 0
    }
  })

  const unreadCounts = await Promise.all(unreadCountsPromises)
  const unreadCountMap = new Map(
    unreadCounts.map(uc => [uc.conversationId, uc.unreadCount])
  )

  // 第五步：组合所有数据
  const conversationsWithDetails = participantData.map((participant) => {
    const conversationId = participant.conversation_id
    const conversations = normalizeSingleRelation(participant.conversations)

    return {
      id: conversationId,
      lastMessage: lastMessageMap.get(conversationId) || null,
      otherUser: otherUserMap.get(conversationId) || null,
      unreadCount: unreadCountMap.get(conversationId) || 0,
      lastReadAt: participant.last_read_at,
      updatedAt: conversations?.updated_at,
    }
  })

  return conversationsWithDetails
}

// 获取或创建与指定用户的会话（优化版）
export async function getOrCreateConversation(userId: string, otherUserId: string) {
  const supabase = await createClient()

  // 使用更高效的查询：通过 JOIN 查找现有会话
  const { data: existingConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId)

  if (existingConversations && existingConversations.length > 0) {
    const conversationIds = existingConversations.map(c => c.conversation_id)

    // 批量检查这些会话中是否有包含 otherUserId 的
    const { data: matchingParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq('user_id', otherUserId)
      .limit(1)

    if (matchingParticipants && matchingParticipants.length > 0) {
      return matchingParticipants[0].conversation_id
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

  return normalizeSingleRelation(data?.users)
}

// 获取未读消息数量（优化版 - 使用单个查询）
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

  // 使用批量查询计算未读消息
  const unreadCountsPromises = conversations.map(async (conv) => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.conversation_id)
      .gt('created_at', conv.last_read_at || '1970-01-01')
      .neq('sender_id', userId)

    return count || 0
  })

  const unreadCounts = await Promise.all(unreadCountsPromises)
  return unreadCounts.reduce((total, count) => total + count, 0)
}
