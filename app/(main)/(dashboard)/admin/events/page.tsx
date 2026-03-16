import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { saveAdminEvent, deleteAdminEvent } from '@/lib/actions/admin-events'
import { normalizeSingleRelation } from '@/lib/utils/normalize'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type EventRecord = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  location: string
  start_time: string
  end_time: string | null
  type: string
  status: string
  participants_count: number | null
  users: {
    username: string
    full_name: string | null
  } | null
}

function formatDateTimeLocal(value: string | null) {
  if (!value) return ''

  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateTime(value: string | null) {
  if (!value) return '未设置'
  return new Date(value).toLocaleString('zh-CN')
}

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data = [] } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      cover_url,
      location,
      start_time,
      end_time,
      type,
      status,
      participants_count,
      users!events_creator_id_fkey(username, full_name)
    `)
    .order('start_time', { ascending: true })

  const events: EventRecord[] = (data || []).map((event) => ({
    ...event,
    users: normalizeSingleRelation(event.users),
  }))
  const activeCount = events.filter((event) => event.status === 'active').length
  const officialCount = events.filter((event) => event.type === 'official').length

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">活动管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          管理全站活动与官方活动状态，统一查看报名数据，避免活动仅停留在用户自发创建层面。
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">活动总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">进行中活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">官方活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officialCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>新建活动</CardTitle>
            <CardDescription>支持在后台直接创建官方活动或线下活动。</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveAdminEvent} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="event-title">
                  活动标题
                </label>
                <Input id="event-title" name="title" placeholder="例如：官方 AMA" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="event-location">
                  活动地点
                </label>
                <Input id="event-location" name="location" placeholder="线上 / 上海 / 北京" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="event-type">
                    活动类型
                  </label>
                  <select
                    id="event-type"
                    name="type"
                    defaultValue="official"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="official">官方活动</option>
                    <option value="offline">线下活动</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="event-status">
                    状态
                  </label>
                  <select
                    id="event-status"
                    name="status"
                    defaultValue="active"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">进行中</option>
                    <option value="cancelled">已取消</option>
                    <option value="ended">已结束</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="event-start-time">
                  开始时间
                </label>
                <Input id="event-start-time" name="start_time" type="datetime-local" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="event-end-time">
                  结束时间
                </label>
                <Input id="event-end-time" name="end_time" type="datetime-local" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="event-cover-url">
                  封面链接
                </label>
                <Input id="event-cover-url" name="cover_url" placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="event-description">
                  描述
                </label>
                <Textarea id="event-description" name="description" className="min-h-24" />
              </div>

              <Button type="submit" className="w-full">
                保存活动
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>活动列表</CardTitle>
            <CardDescription>支持后台统一调整状态、时间、类型与封面信息。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">当前还没有活动。</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="rounded-xl border border-border p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant={event.type === 'official' ? 'secondary' : 'outline'}>
                      {event.type === 'official' ? '官方活动' : '线下活动'}
                    </Badge>
                    <Badge variant={event.status === 'active' ? 'secondary' : 'outline'}>
                      {event.status === 'active' ? '进行中' : event.status === 'cancelled' ? '已取消' : '已结束'}
                    </Badge>
                    <Badge variant="outline">{event.participants_count || 0} 人报名</Badge>
                  </div>

                  <div className="mb-4 text-sm text-muted-foreground">
                    创建者：{event.users?.full_name || event.users?.username || '未知用户'}
                    {' · '}
                    <Link href={`/events/${event.id}`} className="text-primary hover:underline" target="_blank">
                      前台查看
                    </Link>
                  </div>

                  <form action={saveAdminEvent} className="space-y-4">
                    <input type="hidden" name="id" value={event.id} />

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">活动标题</label>
                        <Input name="title" defaultValue={event.title} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">活动地点</label>
                        <Input name="location" defaultValue={event.location} required />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">开始时间</label>
                        <Input name="start_time" type="datetime-local" defaultValue={formatDateTimeLocal(event.start_time)} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">结束时间</label>
                        <Input name="end_time" type="datetime-local" defaultValue={formatDateTimeLocal(event.end_time)} />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">活动类型</label>
                        <select
                          name="type"
                          defaultValue={event.type}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="official">官方活动</option>
                          <option value="offline">线下活动</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">活动状态</label>
                        <select
                          name="status"
                          defaultValue={event.status}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="active">进行中</option>
                          <option value="cancelled">已取消</option>
                          <option value="ended">已结束</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">封面链接</label>
                        <Input name="cover_url" defaultValue={event.cover_url || ''} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">描述</label>
                      <Textarea name="description" defaultValue={event.description || ''} className="min-h-20" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground">
                        开始于 {formatDateTime(event.start_time)}
                        {' · '}
                        结束于 {formatDateTime(event.end_time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="submit" variant="outline">
                          更新活动
                        </Button>
                      </div>
                    </div>
                  </form>

                  <form action={deleteAdminEvent} className="mt-3">
                    <input type="hidden" name="event_id" value={event.id} />
                    <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
                      删除活动
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
