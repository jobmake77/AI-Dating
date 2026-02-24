'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageCircle } from 'lucide-react'

interface Conversation {
  id: string
  lastMessage?: {
    content: string
    created_at: string
    sender_id: string
  }
  otherUser?: {
    id: string
    username: string
    full_name: string | null
    avatar: string | null
  }
  unreadCount: number
  updatedAt?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
}

export function ConversationList({ conversations, activeConversationId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 border border-border rounded-lg">
        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg mb-2">还没有消息</p>
        <p className="text-muted-foreground text-sm">
          访问其他用户的主页，点击"发消息"开始对话
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={`block transition-colors ${
              isActive
                ? 'bg-muted'
                : 'hover:bg-muted/50 active:bg-muted'
            }`}
          >
          <div className="px-4 py-4 flex items-center gap-3">
            {/* 头像 */}
            <div className="relative shrink-0">
              <Avatar className="h-14 w-14 ring-2 ring-background">
                <AvatarImage src={conversation.otherUser?.avatar || undefined} />
                <AvatarFallback className="text-base font-semibold">
                  {(conversation.otherUser?.full_name || conversation.otherUser?.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </span>
                </div>
              )}
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-1 gap-2">
                <span className={`font-semibold text-[15px] truncate ${
                  conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground/90'
                }`}>
                  {conversation.otherUser?.full_name || conversation.otherUser?.username}
                </span>
                {conversation.lastMessage && (
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                      addSuffix: false,
                      locale: zhCN,
                    })}
                  </span>
                )}
              </div>

              <p className={`text-[14px] truncate ${
                conversation.unreadCount > 0
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}>
                {conversation.lastMessage?.content || '开始对话...'}
              </p>
            </div>
          </div>
        </Link>
      )
      })}
    </div>
  )
}
