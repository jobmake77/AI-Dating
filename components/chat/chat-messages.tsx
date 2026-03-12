'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { markConversationAsRead } from '@/lib/actions/chat'
import Image from 'next/image'
import { motion } from 'framer-motion'

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

// 辅助函数：格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
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

    // Setting up realtime subscription

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
          // New message received via Realtime

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

          // Adding message to state
          setMessages((prev) => {
            // 避免重复添加
            if (prev.some(m => m.id === newMessage.id)) {
              // Message already exists, skipping
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
          // Participant updated via Realtime

          // 如果更新的不是当前用户，更新对方的 last_read_at
          if (payload.new.user_id !== currentUserId) {
            setOtherLastReadAt(payload.new.last_read_at)
          }
        }
      )
      .subscribe((status, err) => {
        // Subscription status changed
        if (err) {
          console.error('[ChatMessages] Subscription error:', err)
        }

        // 如果 Realtime 连接失败，使用轮询作为备用
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[ChatMessages] ⚠️ Realtime failed, falling back to polling')

          // 每 3 秒轮询一次新消息
          pollingInterval = setInterval(async () => {
            // Polling for new messages
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
              // Polling found new messages
              setMessages((prev) => [...prev, ...newMessages as Message[]])
              lastCheckedTime = newMessages[newMessages.length - 1].created_at
            }
          }, 3000)
        }
      })

    return () => {
      // Cleaning up subscription
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-muted-foreground">开始对话...</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-4 space-y-3 bg-secondary/20">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === currentUserId

        return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                isCurrentUser
                  ? 'gradient-primary text-white rounded-br-md'
                  : 'bg-card text-foreground border border-border rounded-bl-md shadow-card'
              } ${isImageMessage(message.content) ? 'p-1' : ''}`}
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
                message.content
              )}
              <div className={`text-[10px] mt-1 ${isCurrentUser ? 'text-white/60' : 'text-muted-foreground'}`}>
                {formatTime(message.created_at)}
              </div>
            </div>
          </motion.div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
