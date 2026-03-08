import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 数据库统计 API
 * GET /api/admin/database/stats
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

    // 获取表大小统计
    const { data: tableSizes, error: sizeError } = await supabase
      .from('table_sizes')
      .select('*')
      .limit(20)

    if (sizeError) {
      console.error('获取表大小失败:', sizeError)
    }

    // 获取索引使用统计
    const { data: indexStats, error: indexError } = await supabase
      .from('index_usage_stats')
      .select('*')
      .limit(50)

    if (indexError) {
      console.error('获取索引统计失败:', indexError)
    }

    // 获取未使用的索引
    const { data: unusedIndexes, error: unusedError } = await supabase
      .from('unused_indexes')
      .select('*')

    if (unusedError) {
      console.error('获取未使用索引失败:', unusedError)
    }

    // 获取表统计
    const { data: tableStats, error: statsError } = await supabase
      .from('table_stats')
      .select('*')
      .limit(20)

    if (statsError) {
      console.error('获取表统计失败:', statsError)
    }

    return NextResponse.json({
      status: 'success',
      data: {
        tableSizes: tableSizes || [],
        indexStats: indexStats || [],
        unusedIndexes: unusedIndexes || [],
        tableStats: tableStats || [],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('获取数据库统计失败:', error)
    return NextResponse.json(
      {
        error: 'Failed to get database stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
