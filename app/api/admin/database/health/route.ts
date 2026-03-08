import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 数据库健康检查 API
 * GET /api/admin/database/health
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // 检查用户权限
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 执行健康检查
    const { data: healthCheck, error: healthError } = await supabase
      .rpc('database_health_check')

    if (healthError) {
      throw healthError
    }

    // 获取连接统计
    const { data: connectionStats, error: connError } = await supabase
      .rpc('get_connection_stats')

    if (connError) {
      throw connError
    }

    // 获取慢查询统计
    const { data: slowQueries, error: slowError } = await supabase
      .rpc('get_slow_queries', {
        p_threshold_ms: 1000,
        p_limit: 10
      })

    if (slowError) {
      throw slowError
    }

    // 获取维护建议
    const { data: recommendations, error: recError } = await supabase
      .rpc('get_maintenance_recommendations')

    if (recError) {
      throw recError
    }

    return NextResponse.json({
      status: 'success',
      data: {
        healthCheck: healthCheck || [],
        connectionStats: connectionStats?.[0] || null,
        slowQueries: slowQueries || [],
        recommendations: recommendations || [],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('数据库健康检查失败:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform health check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
