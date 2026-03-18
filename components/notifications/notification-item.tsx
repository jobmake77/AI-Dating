'use client'

import { Notification } from '@/lib/actions/notifications'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2, UserPlus, User, X } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { markAsRead, deleteNotification } from '@/lib/actions/notifications'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'use-intl'

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'repost':
        return <Repeat2 className="w-5 h-5 text-green-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-500" />
    }
  }

  const getMessage = () => {
    const actorName = notification.actor.full_name || notification.actor.username
    switch (notification.type) {
      case 'like':
        return locale === 'en' ? `${actorName} ${t('notifications.like')}` : `${actorName} 赞了你的内容`
      case 'comment':
        return locale === 'en' ? `${actorName} ${t('notifications.comment')}` : `${actorName} 评论了你的内容`
      case 'repost':
        return locale === 'en' ? `${actorName} ${t('notifications.repost')}` : `${actorName} 转发了你的内容`
      case 'follow':
        return locale === 'en' ? `${actorName} ${t('notifications.follow')}` : `${actorName} 关注了你`
    }
  }

  const getLink = () => {
    if (notification.type === 'follow') {
      return `/u/${notification.actor.username}`
    }
    if (notification.content_id) {
      return `/post/${notification.content_id}`
    }
    return '#'
  }

  const handleClick = async () => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id)
        router.refresh()
      } catch (error) {
        console.error('Mark as read error:', error)
      }
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await deleteNotification(notification.id)
      toast.success(t('notificationItem.deleted'))
      router.refresh()
    } catch (error) {
      console.error('Delete notification error:', error)
      toast.error(t('notificationItem.deleteFailed'))
    }
  }

  return (
    <Link href={getLink()} onClick={handleClick}>
      <Card className={`px-6 py-5 hover:bg-muted/50 transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
      }`}>
        <div className="flex items-center gap-4">
          {/* 图标 */}
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          {/* 头像 */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage
              src={notification.actor.avatar || undefined}
              alt={notification.actor.full_name || notification.actor.username}
            />
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <p className="text-base">
              <span className="font-semibold">
                {notification.actor.full_name || notification.actor.username}
              </span>
              {' '}
              <span className="text-muted-foreground">
                {(getMessage()?.split(notification.actor.full_name || notification.actor.username)[1]) || ''}
              </span>
            </p>

            {notification.content && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.content.title}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: locale === 'en' ? enUS : zhCN,
              })}
            </p>
          </div>

          {/* 未读标识和删除按钮 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!notification.is_read && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
