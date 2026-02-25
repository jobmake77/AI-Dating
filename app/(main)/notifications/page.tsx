import { getNotifications, markAllAsReadSilent } from '@/lib/actions/notifications'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Bell, AlertCircle, Heart, MessageCircle, Repeat2, UserPlus, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface NotificationsPageProps {
  searchParams: Promise<{ page?: string }>
}

function formatTime(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 3600000
  if (diff < 24) return `${Math.max(1, Math.floor(diff))}h前`
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'like': return <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
    case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />
    case 'repost': return <Repeat2 className="w-4 h-4 text-green-500" />
    case 'follow': return <UserPlus className="w-4 h-4 text-purple-500" />
    default: return null
  }
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const params = await searchParams
  const page = Number(params.page) || 1

  try {
    // 进入页面时自动标记全部已读
    await markAllAsReadSilent()

    const { notifications, totalPages } = await getNotifications(page)

    return (
      <div className="min-h-screen bg-background">
        {/* 页面头部 */}
        <div className="sticky top-[56px] z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <h1 className="text-xl font-bold">通知</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="py-20">
            <EmptyState
              icon={Bell}
              title="暂无通知"
              description="当有人点赞、评论或关注你时，你会在这里收到通知"
            />
          </div>
        ) : (
          <div>
            {notifications.map((n) => {
              const actorName = n.actor.full_name || n.actor.username
              const href = n.type === 'follow'
                ? `/u/${n.actor.username}`
                : n.content_id ? `/post/${n.content_id}` : '#'

              let actionText = ''
              switch (n.type) {
                case 'like': actionText = '赞了你的内容'; break
                case 'comment': actionText = '评论了你的内容'; break
                case 'repost': actionText = '转发了你的内容'; break
                case 'follow': actionText = '关注了你'; break
              }

              return (
                <Link
                  key={n.id}
                  href={href}
                  className="flex gap-3 px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors duration-150"
                >
                  {/* 类型图标列 */}
                  <div className="flex flex-col items-center w-10 flex-shrink-0 pt-1">
                    <TypeIcon type={n.type} />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    {/* 头像 */}
                    <div className="mb-2">
                      {n.actor.avatar ? (
                        <img
                          src={n.actor.avatar}
                          alt={actorName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* 文字 */}
                    <p className="text-[15px] leading-snug">
                      <span className="font-bold">{actorName}</span>
                      {' '}
                      <span className="text-foreground/80">{actionText}</span>
                    </p>

                    {n.content && (
                      <p className="text-[14px] text-muted-foreground mt-1 line-clamp-2">
                        {n.content.title}
                      </p>
                    )}

                    <p className="text-[13px] text-muted-foreground mt-1">
                      {formatTime(n.created_at)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-6">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <a href={`/notifications?page=${page - 1}`}>上一页</a>
              </Button>
            )}
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <a href={`/notifications?page=${page + 1}`}>下一页</a>
              </Button>
            )}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Get notifications error:', error)
    return (
      <div className="py-20">
        <EmptyState
          icon={AlertCircle}
          title="加载通知失败"
          description="请稍后重试"
        />
      </div>
    )
  }
}
