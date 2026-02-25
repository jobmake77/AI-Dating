import { requireAdmin } from '@/lib/middleware/admin'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { GrowthChart } from '@/components/admin/growth-chart'

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
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('contents').select('*', { count: 'exact', head: true }),
    supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('users').select('created_at').gte('created_at', since.toISOString()),
    supabase.from('contents').select('created_at').gte('created_at', since.toISOString()),
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

  const stats = [
    { label: '总用户数', value: totalUsers ?? 0, icon: Users, href: '/admin/users', color: 'text-blue-500' },
    { label: '总内容数', value: totalContents ?? 0, icon: FileText, href: '/admin/contents', color: 'text-green-500' },
    { label: '待审核', value: pendingContents ?? 0, icon: Clock, href: '/admin/moderation', color: 'text-yellow-500' },
    { label: '已发布', value: approvedContents ?? 0, icon: CheckCircle, href: '/admin/contents', color: 'text-emerald-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <p className="text-muted-foreground mt-1">平台数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-accent/30 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 增长曲线 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">近 30 天增长趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <GrowthChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}
