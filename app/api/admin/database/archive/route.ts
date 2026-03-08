import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 数据归档 API
 * POST /api/admin/database/archive
 */
export async function POST() {
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

    // 运行数据归档
    const { data: archiveResults, error: archiveError } = await supabase
      .rpc('run_all_archiving')

    if (archiveError) {
      throw archiveError
    }

    return NextResponse.json({
      status: 'success',
      data: {
        results: archiveResults || [],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('数据归档失败:', error)
    return NextResponse.json(
      {
        error: 'Failed to archive data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * 获取归档日志
 * GET /api/admin/database/archive
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

    // 获取归档日志
    const { data: archiveLogs, error: logsError } = await supabase
      .from('archive_logs')
      .select('*')
      .order('archive_date', { ascending: false })
      .limit(100)

    if (logsError) {
      throw logsError
    }

    return NextResponse.json({
      status: 'success',
      data: {
        logs: archiveLogs || [],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('获取归档日志失败:', error)
    return NextResponse.json(
      {
        error: 'Failed to get archive logs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
