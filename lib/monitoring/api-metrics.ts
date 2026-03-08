/**
 * API 响应时间追踪
 * 监控和记录 API 端点性能
 */

import { NextRequest, NextResponse } from 'next/server'

export interface ApiMetrics {
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
  userAgent?: string
  ip?: string
}

// 响应时间阈值（毫秒）
const SLOW_API_THRESHOLD = 2000 // 2 秒

/**
 * API 性能监控中间件
 */
export function withApiMetrics(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now()
    const url = new URL(req.url)

    let response: NextResponse

    try {
      response = await handler(req)
    } catch (error) {
      const duration = performance.now() - startTime

      // 记录错误的 API 调用
      await logApiMetrics({
        endpoint: url.pathname,
        method: req.method,
        statusCode: 500,
        duration,
        timestamp: Date.now(),
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      })

      throw error
    }

    const duration = performance.now() - startTime

    // 记录 API 指标
    await logApiMetrics({
      endpoint: url.pathname,
      method: req.method,
      statusCode: response.status,
      duration,
      timestamp: Date.now(),
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    })

    // 添加性能头
    response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)

    // 如果响应时间过长，添加警告头
    if (duration > SLOW_API_THRESHOLD) {
      response.headers.set('X-Slow-Response', 'true')
    }

    return response
  }
}

/**
 * 记录 API 指标
 */
async function logApiMetrics(metrics: ApiMetrics): Promise<void> {
  try {
    // 开发环境：输出到控制台
    if (process.env.NODE_ENV === 'development') {
      const color = metrics.duration > SLOW_API_THRESHOLD ? '\x1b[31m' : '\x1b[32m'
      const reset = '\x1b[0m'

      console.log(
        `${color}[API]${reset} ${metrics.method} ${metrics.endpoint} - ${metrics.statusCode} - ${metrics.duration.toFixed(2)}ms`
      )
    }

    // 生产环境：发送到分析端点
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/analytics/api-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      }).catch(() => {
        // 静默失败，不影响主请求
      })
    }
  } catch (error) {
    // 静默失败
  }
}

/**
 * 获取 API 性能统计
 */
export async function getApiMetricsStats(
  timeRange: { start: Date; end: Date } = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 小时前
    end: new Date(),
  }
) {
  try {
    const response = await fetch(
      `/api/analytics/api-metrics?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`
    )

    if (!response.ok) throw new Error('Failed to fetch API metrics')

    return await response.json()
  } catch (error) {
    console.error('Failed to get API metrics stats:', error)
    return null
  }
}

/**
 * 性能预算检查
 */
export function checkPerformanceBudget(duration: number, budget: number): boolean {
  return duration <= budget
}

/**
 * 性能预算配置
 */
export const PERFORMANCE_BUDGETS = {
  // API 端点预算（毫秒）
  api: {
    '/api/contents': 1000,
    '/api/users': 800,
    '/api/search': 1500,
    '/api/trending': 1000,
    '/api/recommendations': 2000,
  },
  // 页面加载预算（毫秒）
  pages: {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1, // Cumulative Layout Shift
    TTFB: 600, // Time to First Byte
  },
} as const
