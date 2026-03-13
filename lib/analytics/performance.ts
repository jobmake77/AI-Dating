/**
 * 性能监控工具
 * 收集和分析页面性能数据
 */

export interface PerformanceMetrics {
  // 导航时间
  navigationTiming: {
    dns: number
    tcp: number
    request: number
    response: number
    domProcessing: number
    domContentLoaded: number
    loadComplete: number
    ttfb: number
  }
  // 资源加载
  resources: {
    count: number
    totalSize: number
    totalDuration: number
    byType: Record<string, { count: number; size: number; duration: number }>
  }
  // 内存使用（如果可用）
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  // 页面信息
  page: {
    url: string
    referrer: string
    userAgent: string
  }
  // 时间戳
  timestamp: number
}

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

type BrowserPerformance = Performance & {
  memory?: PerformanceMemory
}

/**
 * 收集导航时间指标
 */
function collectNavigationTiming(): PerformanceMetrics['navigationTiming'] | null {
  if (typeof window === 'undefined' || !window.performance) return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return null

  return {
    dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
    tcp: Math.round(navigation.connectEnd - navigation.connectStart),
    request: Math.round(navigation.responseStart - navigation.requestStart),
    response: Math.round(navigation.responseEnd - navigation.responseStart),
    domProcessing: Math.round(navigation.domInteractive - navigation.responseEnd),
    domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
    loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
    ttfb: Math.round(navigation.responseStart - navigation.requestStart),
  }
}

/**
 * 收集资源加载指标
 */
function collectResourceMetrics(): PerformanceMetrics['resources'] {
  if (typeof window === 'undefined' || !window.performance) {
    return { count: 0, totalSize: 0, totalDuration: 0, byType: {} }
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const byType: Record<string, { count: number; size: number; duration: number }> = {}

  let totalSize = 0
  let totalDuration = 0

  resources.forEach((resource) => {
    const type = resource.initiatorType || 'other'
    const size = resource.transferSize || 0
    const duration = resource.duration

    if (!byType[type]) {
      byType[type] = { count: 0, size: 0, duration: 0 }
    }

    byType[type].count++
    byType[type].size += size
    byType[type].duration += duration

    totalSize += size
    totalDuration += duration
  })

  return {
    count: resources.length,
    totalSize: Math.round(totalSize),
    totalDuration: Math.round(totalDuration),
    byType,
  }
}

/**
 * 收集内存使用指标
 */
function collectMemoryMetrics(): PerformanceMetrics['memory'] | undefined {
  if (typeof window === 'undefined') return undefined

  const memory = (performance as BrowserPerformance).memory
  if (!memory) return undefined

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  }
}

/**
 * 收集完整的性能指标
 */
export function collectPerformanceMetrics(): PerformanceMetrics | null {
  if (typeof window === 'undefined') return null

  const navigationTiming = collectNavigationTiming()
  if (!navigationTiming) return null

  return {
    navigationTiming,
    resources: collectResourceMetrics(),
    memory: collectMemoryMetrics(),
    page: {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    },
    timestamp: Date.now(),
  }
}

/**
 * 发送性能数据到分析端点
 */
export async function sendPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
  try {
    // 开发环境：输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Metrics]', {
        ttfb: metrics.navigationTiming.ttfb,
        domContentLoaded: metrics.navigationTiming.domContentLoaded,
        loadComplete: metrics.navigationTiming.loadComplete,
        resourceCount: metrics.resources.count,
        totalSize: `${(metrics.resources.totalSize / 1024).toFixed(2)} KB`,
      })
    }

    // 生产环境：发送到分析端点
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      })
    }
  } catch (error) {
    console.error('Failed to send performance metrics:', error)
  }
}

/**
 * 在页面加载完成后自动收集性能数据
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return

  // 等待页面完全加载
  if (document.readyState === 'complete') {
    collectAndSend()
  } else {
    window.addEventListener('load', collectAndSend)
  }
}

function collectAndSend() {
  // 延迟收集，确保所有资源都已加载
  setTimeout(() => {
    const metrics = collectPerformanceMetrics()
    if (metrics) {
      sendPerformanceMetrics(metrics)
    }
  }, 1000)
}
