import { requireAdmin } from '@/lib/middleware/admin'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { Activity } from 'lucide-react'

function buildLast30Days() {
  const days: { date: string; users: number; contents: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      users: 0,
      contents: 0,
    })
  }
  return days
}

export default async function AdminPage() {
  await requireAdmin()
  const supabase = await createClient()

  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  const [
    { count: totalUsers },
    { count: totalContents },
    { count: pendingContents },
    { count: approvedContents },
    { data: recentUsers },
    { data: recentContents },
    { data: pendingContentData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('contents').select('*', { count: 'exact', head: true }),
    supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('users').select('created_at').gte('created_at', since.toISOString()),
    supabase.from('contents').select('created_at').gte('created_at', since.toISOString()),
    supabase.from('contents').select('id, title, created_at, users(username)').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
  ])

  // 按日期聚合
  const chartData = buildLast30Days()
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
  recentUsers?.forEach((u) => {
    const key = fmt(u.created_at)
    const item = chartData.find((d) => d.date === key)
    if (item) item.users++
  })
  recentContents?.forEach((c) => {
    const key = fmt(c.created_at)
    const item = chartData.find((d) => d.date === key)
    if (item) item.contents++
  })

  // 计算增长率
  const todayUsers = recentUsers?.filter(u => {
    const d = new Date(u.created_at)
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  }).length ?? 0

  const todayContents = recentContents?.filter(c => {
    const d = new Date(c.created_at)
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  }).length ?? 0

  const stats = [
    { label: '总用户', value: totalUsers ?? 0, change: `+${todayUsers}`, gradient: 'gradient-primary' },
    { label: '今日帖子', value: todayContents, change: '', gradient: 'gradient-info' },
    { label: '活跃用户', value: Math.floor((totalUsers ?? 0) * 0.15), change: '+8%', gradient: 'gradient-ocean' },
    { label: '待审核', value: pendingContents ?? 0, change: '', gradient: 'gradient-warm' },
  ]

  // 格式化待审核内容
  const pendingContent = (pendingContentData ?? []).map((item) => {
    const createdAt = new Date(item.created_at)
    const now = new Date()
    const diffMs = now.getTime() - createdAt.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    let time = ''
    if (diffMins < 60) {
      time = `${diffMins}m`
    } else if (diffHours < 24) {
      time = `${diffHours}h`
    } else {
      time = `${diffDays}d`
    }

    return {
      id: item.id,
      title: item.title,
      author: (item.users as any)?.username ?? '未知用户',
      time,
      reason: '待审核',
      severity: 'medium',
    }
  })

  return <AdminDashboard stats={stats} chartData={chartData} pendingContent={pendingContent} />
}
