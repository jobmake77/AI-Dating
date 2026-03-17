import { getNotifications, markAllAsReadSilent } from '@/lib/actions/notifications'
import { EmptyState } from '@/components/empty-state'
import { Bell, AlertCircle, Heart, MessageSquare, UserPlus, Award } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface NotificationsPageProps {
  searchParams: Promise<{ page?: string; filter?: string }>
}

function formatTime(dateStr: string, locale: string): string {
  const now = Date.now()
  const time = new Date(dateStr).getTime()
  const diff = (now - time) / 60000 // 分钟

  if (diff < 60) return `${Math.max(1, Math.floor(diff))}m`
  if (diff < 1440) return `${Math.floor(diff / 60)}h`
  if (diff < 10080) return `${Math.floor(diff / 1440)}d`

  const d = new Date(dateStr)
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
    month: 'numeric',
    day: 'numeric',
  })
}

const iconMap: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageSquare,
  follow: UserPlus,
  event_reminder: Award,
  community_invite: Award,
  repost: MessageSquare,
}

const colorMap: Record<string, string> = {
  like: 'text-[hsl(340_82%_52%)] bg-[hsl(340_82%_52%/0.1)]',
  comment: 'text-blue-500 bg-blue-500/10',
  follow: 'text-purple-500 bg-purple-500/10',
  event_reminder: 'text-amber-500 bg-amber-500/10',
  community_invite: 'text-amber-500 bg-amber-500/10',
  repost: 'text-green-500 bg-green-500/10',
}

async function loadNotificationsPageData(page: number, filter: string) {
  try {
    await markAllAsReadSilent()

    const { notifications, totalPages } = await getNotifications(page)
    const filteredNotifications = filter === 'all'
      ? notifications
      : filter === 'system'
        ? notifications.filter((notification) =>
            ['event_reminder', 'community_invite'].includes(notification.type)
          )
        : notifications.filter((notification) => notification.type === filter)

    return {
      filteredNotifications,
      totalPages,
      hasError: false,
    }
  } catch (error) {
    console.error('Get notifications error:', error)

    return {
      filteredNotifications: [],
      totalPages: 0,
      hasError: true,
    }
  }
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback?: string) => getTranslation(locale, `notificationsPage.${key}`, fallback)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const page = Number(params.page) || 1
  const filter = params.filter || 'all'
  const { filteredNotifications, totalPages, hasError } = await loadNotificationsPageData(page, filter)
  const filterTabs = [
    { key: 'all', label: t('tabAll', '全部') },
    { key: 'like', label: t('tabLike', '点赞') },
    { key: 'comment', label: t('tabComment', '评论') },
    { key: 'follow', label: t('tabFollow', '关注') },
    { key: 'system', label: t('tabSystem', '系统') },
  ]

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <EmptyState
            icon={AlertCircle}
            title={t('loadFailed', '加载通知失败')}
            description={t('retryLater', '请稍后重试')}
          />
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('title', '通知')}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle', '查看你的最新动态')}</p>
              </div>
            </div>
          </div>

          {/* 筛选标签 */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 mb-4 shadow-sm">
            {filterTabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/notifications?filter=${tab.key}`}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* 通知列表 */}
          {filteredNotifications.length === 0 ? (
            <div className="py-20">
              <EmptyState
                icon={Bell}
                title={t('empty', '暂无通知')}
                description={t('emptyDescription', '当有人点赞、评论或关注你时，你会在这里收到通知')}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden divide-y divide-border shadow-sm">
              {filteredNotifications.map((n) => {
                const Icon = iconMap[n.type] || Bell
                const colors = colorMap[n.type] || 'text-gray-500 bg-gray-500/10'
                const actorName = n.actor.full_name || n.actor.username
                const href = n.type === 'follow'
                  ? `/u/${n.actor.username}`
                  : n.content_id ? `/post/${n.content_id}` : '#'

                let actionText = ''
                switch (n.type) {
                  case 'like': actionText = t('likedPost', '赞了你的帖子'); break
                  case 'comment': actionText = t('commentedPost', '评论了你的帖子'); break
                  case 'repost': actionText = t('repostedPost', '转发了你的帖子'); break
                  case 'follow': actionText = t('followedYou', '关注了你'); break
                  case 'event_reminder': actionText = t('eventReminder', '活动提醒'); break
                  case 'community_invite': actionText = t('communityInvite', '邀请你加入社区'); break
                }

                return (
                  <Link
                    key={n.id}
                    href={href}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-all hover:bg-secondary/50 ${
                      !n.is_read ? 'bg-primary/[0.03] border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    {/* 图标 */}
                    <div className={`mt-0.5 rounded-full p-1.5 ${colors}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-medium text-primary hover:underline">{actorName}</span>
                        {' '}
                        {actionText}
                        {n.content && (
                          <span className="text-muted-foreground">{locale === 'en' ? ` "${n.content.title}"` : `「${n.content.title}」`}</span>
                        )}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at, locale)}</span>
                    </div>

                    {/* 未读标识 */}
                    {!n.is_read && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-6 text-xs">
              {page > 1 && (
                <Link
                  href={`/notifications?page=${page - 1}&filter=${filter}`}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  {t('previous', '上一页')}
                </Link>
              )}
              <span className="flex items-center px-3 text-muted-foreground">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/notifications?page=${page + 1}&filter=${filter}`}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  {t('next', '下一页')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
  )
}
