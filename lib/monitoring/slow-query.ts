/**
 * 慢查询日志系统
 * 记录和分析数据库慢查询
 */

import { createClient } from '@/lib/supabase/server'

export interface SlowQueryLog {
  id: string
  query: string
  duration: number
  timestamp: number
  table: string
  operation: string
  params?: Record<string, any>
  stackTrace?: string
}

// 慢查询阈值（毫秒）
const SLOW_QUERY_THRESHOLD = 1000 // 1 秒

/**
 * 查询性能监控装饰器
 */
export async function monitorQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: {
    table?: string
    operation?: string
    params?: Record<string, any>
  } = {}
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await queryFn()
    const duration = performance.now() - startTime

    // 如果查询时间超过阈值，记录慢查询
    if (duration > SLOW_QUERY_THRESHOLD) {
      await logSlowQuery({
        query: queryName,
        duration,
        timestamp: Date.now(),
        table: options.table || 'unknown',
        operation: options.operation || 'select',
        params: options.params,
        stackTrace: new Error().stack,
      })
    }

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    // 记录失败的查询
    await logSlowQuery({
      query: queryName,
      duration,
      timestamp: Date.now(),
      table: options.table || 'unknown',
      operation: options.operation || 'select',
      params: options.params,
      stackTrace: error instanceof Error ? error.stack : undefined,
    })

    throw error
  }
}

/**
 * 记录慢查询
 */
async function logSlowQuery(log: Omit<SlowQueryLog, 'id'>): Promise<void> {
  try {
    // 开发环境：输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Slow Query]', {
        query: log.query,
        duration: `${log.duration.toFixed(2)}ms`,
        table: log.table,
        operation: log.operation,
      })
    }

    // 生产环境：保存到数据库
    if (process.env.NODE_ENV === 'production') {
      const supabase = await createClient()
      await supabase.from('slow_query_logs').insert({
        query: log.query,
        duration: log.duration,
        timestamp: new Date(log.timestamp).toISOString(),
        table_name: log.table,
        operation: log.operation,
        params: log.params,
        stack_trace: log.stackTrace,
      })
    }
  } catch (error) {
    console.error('Failed to log slow query:', error)
  }
}

/**
 * 获取慢查询统计
 */
export async function getSlowQueryStats(
  timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 小时前
    end: new Date(),
  }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('slow_query_logs')
      .select('*')
      .gte('timestamp', timeRange.start.toISOString())
      .lte('timestamp', timeRange.end.toISOString())
      .order('duration', { ascending: false })

    if (error) throw error

    // 统计分析
    const stats = {
      total: data.length,
      avgDuration: data.reduce((sum, log) => sum + log.duration, 0) / data.length,
      maxDuration: Math.max(...data.map((log) => log.duration)),
      byTable: {} as Record<string, number>,
      byOperation: {} as Record<string, number>,
      slowest: data.slice(0, 10),
    }

    // 按表统计
    data.forEach((log) => {
      stats.byTable[log.table_name] = (stats.byTable[log.table_name] || 0) + 1
      stats.byOperation[log.operation] = (stats.byOperation[log.operation] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error('Failed to get slow query stats:', error)
    return null
  }
}

/**
 * 清理旧的慢查询日志
 */
export async function cleanupSlowQueryLogs(daysToKeep: number = 7): Promise<number> {
  try {
    const supabase = await createClient()
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('slow_query_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString())
      .select('id')

    if (error) throw error

    return data?.length || 0
  } catch (error) {
    console.error('Failed to cleanup slow query logs:', error)
    return 0
  }
}
