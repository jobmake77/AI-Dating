import { getNotifications, markAllAsRead } from '@/lib/actions/notifications'
import { NotificationItem } from '@/components/notifications/notification-item'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface NotificationsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const page = Number(params.page) || 1

  try {
    const { notifications, totalPages } = await getNotifications(page)

    const hasUnread = notifications.some(n => !n.is_read)

    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto py-8 px-4">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <h1 className="text-3xl font-bold">通知</h1>
            </div>
            {hasUnread && (
              <form action={markAllAsRead}>
                <Button type="submit" variant="outline" size="sm">
                  <CheckCheck className="w-4 h-4 mr-2" />
                  全部已读
                </Button>
              </form>
            )}
          </div>

          {/* 通知列表 */}
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {page > 1 && (
                <Button asChild variant="outline">
                  <a href={`/notifications?page=${page - 1}`}>上一页</a>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                第 {page} / {totalPages} 页
              </span>
              {page < totalPages && (
                <Button asChild variant="outline">
                  <a href={`/notifications?page=${page + 1}`}>下一页</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Get notifications error:', error)
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <div className="text-center py-20">
            <p className="text-muted-foreground">加载通知失败</p>
            <p className="text-sm text-muted-foreground mt-2">
              请确保数据库中已创建通知表
            </p>
          </div>
        </div>
      </div>
    )
  }
}
