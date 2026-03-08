import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PerformanceDashboard } from '@/components/analytics/performance-dashboard'

export const metadata: Metadata = {
  title: '性能监控',
  description: '查看网站性能指标和 Core Web Vitals',
}

export default async function PerformancePage() {
  const supabase = await createClient()

  // 检查用户权限
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    redirect('/')
  }

  // 获取最近 7 天的 Web Vitals 数据
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: webVitals } = await supabase
    .from('web_vitals')
    .select('*')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1000)

  // 获取最近 7 天的性能指标
  const { data: performanceMetrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1000)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">性能监控</h1>
        <p className="text-muted-foreground mt-2">
          查看网站性能指标和 Core Web Vitals 数据
        </p>
      </div>

      <PerformanceDashboard
        webVitals={webVitals || []}
        performanceMetrics={performanceMetrics || []}
      />
    </div>
  )
}
