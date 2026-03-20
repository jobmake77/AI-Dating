'use client'

import Link from 'next/link'
import { formatISODate } from '@/lib/utils/date'
import { MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'use-intl'

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

// 辅助函数：检测是否是图片消息
function isImageMessage(content: string): boolean {
  return content.startsWith('[image:') && content.endsWith(']')
}

// 辅助函数：格式化时间
function formatTime(dateString: string, locale: string, justNowLabel: string): string {
  void locale
  void justNowLabel
  return formatISODate(dateString)
}

export function ConversationList({ conversations, activeConversationId }: ConversationListProps) {
  const t = useTranslations('messagesPage')
  const locale = useLocale()
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground text-xs mb-1">{t('noMessages')}</p>
        <p className="text-muted-foreground text-[10px]">
          {t('startConversationHint')}
        </p>
      </div>
    )
  }

  return (
    <div>
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId
        const displayContent = conversation.lastMessage?.content
          ? (isImageMessage(conversation.lastMessage.content) ? t('imageMessage') : conversation.lastMessage.content)
          : t('startConversation')

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
          >
            <button
              className={`w-full text-left px-3 py-3 flex items-center gap-2.5 transition-all border-l-2 ${
                isActive ? 'bg-primary/5 border-primary' : 'border-transparent hover:bg-secondary/50'
              }`}
            >
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">
                  {(conversation.otherUser?.full_name || conversation.otherUser?.username || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate">
                    {conversation.otherUser?.full_name || conversation.otherUser?.username}
                  </span>
                  {conversation.lastMessage && (
                    <span className="text-[10px] text-muted-foreground ml-1 shrink-0">
                      {formatTime(conversation.lastMessage.created_at, locale, t('justNow'))}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {displayContent}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[9px] font-bold text-white shadow-primary">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </button>
          </Link>
        )
      })}
    </div>
  )
}
