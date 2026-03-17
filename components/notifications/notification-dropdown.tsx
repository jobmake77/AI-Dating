'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { getNotifications, markAllAsRead } from '@/lib/actions/notifications'
import type { Notification } from '@/lib/actions/notifications'
import { useOptionalTranslation } from '@/components/i18n/locale-provider'
import { useLocale } from 'use-intl'

function formatTime(dateStr: string, locale: 'zh' | 'en'): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 3600000
  if (diff < 24) {
    const hours = Math.max(1, Math.floor(diff))
    return locale === 'en' ? `${hours}h ago` : `${hours}h前`
  }
  const d = new Date(dateStr)
  return locale === 'en' ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getMonth() + 1}月${d.getDate()}日`
}

function typeIcon(type: string) {
  switch (type) {
    case 'like': return <Heart className="w-3.5 h-3.5 text-red-500" fill="currentColor" />
    case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
    case 'repost': return <Repeat2 className="w-3.5 h-3.5 text-green-500" />
    case 'follow': return <UserPlus className="w-3.5 h-3.5 text-purple-500" />
  }
}

function typeText(n: Notification, locale: 'zh' | 'en'): string {
  const name = n.actor.full_name || n.actor.username
  switch (n.type) {
    case 'like': return locale === 'en' ? `${name} liked your post` : `${name} 赞了你的内容`
    case 'comment': return locale === 'en' ? `${name} commented on your post` : `${name} 评论了你的内容`
    case 'repost': return locale === 'en' ? `${name} reposted your post` : `${name} 转发了你的内容`
    case 'follow': return locale === 'en' ? `${name} followed you` : `${name} 关注了你`
    default: return ''
  }
}

interface Props {
  unreadCount: number
  onRead: () => void
}

export function NotificationDropdown({ unreadCount, onRead }: Props) {
  const locale = useLocale() as 'zh' | 'en'
  const t = useOptionalTranslation()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (!next) return
    setLoading(true)
    try {
      const { notifications } = await getNotifications(1, 8)
      setItems(notifications)
      if (unreadCount > 0) {
        await markAllAsRead()
        onRead()
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="relative"
        aria-label={t('nav.notifications', '通知')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-background" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">{t('nav.notifications', '通知')}</span>
            <Link
              href="/notifications"
              className="text-xs text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              {t('common.viewAll', '查看全部')}
            </Link>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">{t('common.loading', '加载中...')}</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">{t('notifications.empty', '暂无通知')}</div>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.type === 'follow' ? `/u/${n.actor.username}` : n.content_id ? `/post/${n.content_id}` : '#'}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors border-b border-border/50 last:border-0"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={n.actor.avatar || undefined} />
                      <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                      {typeIcon(n.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug line-clamp-2">{typeText(n, locale)}</p>
                    {n.content && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{n.content.title}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{formatTime(n.created_at, locale)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
