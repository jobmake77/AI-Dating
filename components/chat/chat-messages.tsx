'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { markConversationAsRead } from '@/lib/actions/chat'
import Image from 'next/image'
import { Circle, CheckCircle } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender?: {
    id: string
    username: string
    full_name: string | null
    avatar: string | null
  }
}

interface ChatMessagesProps {
  conversationId: string
  initialMessages: Message[]
  otherUserLastReadAt: string | null
  currentUserId: string
}

// 辅助函数：检测是否是图片消息
function isImageMessage(content: string): boolean {
  return content.startsWith('[image:') && content.endsWith(']')
}

// 辅助函数：提取图片URL
function extractImageUrl(content: string): string {
  return content.slice(7, -1) // 移除 '[image:' 和 ']'
}

export function ChatMessages({ conversationId, initialMessages, otherUserLastReadAt, currentUserId }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(otherUserLastReadAt)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 标记为已读
  useEffect(() => {
    markConversationAsRead(conversationId)
  }, [conversationId])

  // 实时订阅新消息（带轮询备用方案）
  useEffect(() => {
    const supabase = createClient()
    let pollingInterval: NodeJS.Timeout | null = null
    let lastCheckedTime = new Date().toISOString()

    console.log('[ChatMessages] Setting up realtime subscription for:', conversationId)
    console.log('[ChatMessages] Current user ID:', currentUserId)

    const channel = supabase
      .channel(`conversation:${conversationId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('[ChatMessages] ✅ New message received via Realtime:', payload)

          // 获取发送者信息
          const { data: sender } = await supabase
            .from('users')
            .select('id, username, full_name, avatar')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage = {
            ...payload.new,
            sender,
          } as Message

          console.log('[ChatMessages] Adding message to state:', newMessage)
          setMessages((prev) => {
            // 避免重复添加
            if (prev.some(m => m.id === newMessage.id)) {
              console.log('[ChatMessages] Message already exists, skipping')
              return prev
            }
            return [...prev, newMessage]
          })

          // 如果是别人发的消息，标记为已读
          if (payload.new.sender_id !== currentUserId) {
            markConversationAsRead(conversationId)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('[ChatMessages] ✅ Participant updated via Realtime:', payload)

          // 如果更新的不是当前用户，更新对方的 last_read_at
          if (payload.new.user_id !== currentUserId) {
            setOtherLastReadAt(payload.new.last_read_at)
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[ChatMessages] Subscription status:', status)
        if (err) {
          console.error('[ChatMessages] Subscription error:', err)
        }

        // 如果 Realtime 连接失败，使用轮询作为备用
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[ChatMessages] ⚠️ Realtime failed, falling back to polling')

          // 每 3 秒轮询一次新消息
          pollingInterval = setInterval(async () => {
            console.log('[ChatMessages] Polling for new messages...')
            const { data: newMessages } = await supabase
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
              .gt('created_at', lastCheckedTime)
              .order('created_at', { ascending: true })

            if (newMessages && newMessages.length > 0) {
              console.log('[ChatMessages] ✅ Polling found new messages:', newMessages.length)
              setMessages((prev) => [...prev, ...newMessages as Message[]])
              lastCheckedTime = newMessages[newMessages.length - 1].created_at
            }
          }, 3000)
        }
      })

    return () => {
      console.log('[ChatMessages] Cleaning up subscription')
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">开始对话...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUserId
          const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id

          // 判断消息是否已读（只对当前用户发送的消息显示）
          const isRead = isCurrentUser && otherLastReadAt &&
            new Date(message.created_at) <= new Date(otherLastReadAt)

          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
            >
              {/* 头像 */}
              <div className="shrink-0 w-8">
                {showAvatar && !isCurrentUser ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender?.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {(message.sender?.full_name || message.sender?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
              </div>

              {/* 消息气泡 */}
              <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%] sm:max-w-[60%]`}>
                <div
                  className={`group relative rounded-2xl shadow-sm ${
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-background border border-border rounded-bl-sm'
                  } ${isImageMessage(message.content) ? 'p-1' : 'px-4 py-2.5'}`}
                >
                  {isImageMessage(message.content) ? (
                    <div className="relative w-full max-w-sm">
                      <Image
                        src={extractImageUrl(message.content)}
                        alt="聊天图片"
                        width={300}
                        height={300}
                        className="rounded-xl object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                </div>

                {/* 时间戳和已读状态 */}
                <div className={`flex items-center gap-1 mt-1 px-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(message.created_at), 'HH:mm', { locale: zhCN })}
                  </span>
                  {isCurrentUser && (
                    <span className="text-muted-foreground">
                      {isRead ? (
                        <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
