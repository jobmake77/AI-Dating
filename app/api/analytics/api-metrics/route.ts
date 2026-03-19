/**
 * API 性能指标收集端点
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const metrics = await req.json()

    // 验证数据
    if (!metrics.endpoint || !metrics.method || !metrics.duration) {
      return NextResponse.json({ error: 'Invalid metrics data' }, { status: 400 })
    }

    // 开发环境：只记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Metrics]', metrics)
      return NextResponse.json({ success: true })
    }

    // 生产环境：保存到数据库
    const supabase = createAdminClient()

    const { error } = await supabase.from('api_metrics').insert({
      endpoint: metrics.endpoint,
      method: metrics.method,
      status_code: metrics.statusCode,
      duration: metrics.duration,
      timestamp: new Date(metrics.timestamp).toISOString(),
      user_agent: metrics.userAgent,
      ip: metrics.ip,
    })

    if (error) {
      console.error('Failed to save API metrics:', error)
      return NextResponse.json({ error: 'Failed to save metrics' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userRow?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json({ error: 'Missing time range' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('api_metrics')
      .select('*')
      .gte('timestamp', start)
      .lte('timestamp', end)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Failed to fetch API metrics:', error)
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
    }

    // 统计分析
    const stats = {
      total: data.length,
      avgDuration: data.reduce((sum, m) => sum + m.duration, 0) / data.length,
      maxDuration: Math.max(...data.map((m) => m.duration)),
      minDuration: Math.min(...data.map((m) => m.duration)),
      byEndpoint: {} as Record<string, { count: number; avgDuration: number }>,
      byStatus: {} as Record<number, number>,
    }

    // 按端点统计
    data.forEach((metric) => {
      if (!stats.byEndpoint[metric.endpoint]) {
        stats.byEndpoint[metric.endpoint] = { count: 0, avgDuration: 0 }
      }
      stats.byEndpoint[metric.endpoint].count++
      stats.byEndpoint[metric.endpoint].avgDuration += metric.duration
    })

    // 计算平均值
    Object.keys(stats.byEndpoint).forEach((endpoint) => {
      stats.byEndpoint[endpoint].avgDuration /= stats.byEndpoint[endpoint].count
    })

    // 按状态码统计
    data.forEach((metric) => {
      stats.byStatus[metric.status_code] = (stats.byStatus[metric.status_code] || 0) + 1
    })

    return NextResponse.json({ stats, data: data.slice(0, 100) })
  } catch (error) {
    console.error('API metrics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
