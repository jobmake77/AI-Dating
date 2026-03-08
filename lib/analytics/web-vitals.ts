/**
 * Web Vitals 追踪工具
 * 追踪 Core Web Vitals 性能指标
 */

import type { Metric } from 'web-vitals'

export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
}

/**
 * 评估性能指标等级
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Core Web Vitals 阈值
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
    // FID 已被 INP 取代（保留以兼容旧数据）
    FID: { good: 100, poor: 300 },
  }

  const threshold = thresholds[name]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * 发送 Web Vitals 数据到分析端点
 */
export function sendToAnalytics(metric: Metric) {
  const webVitalsMetric: WebVitalsMetric = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getMetricRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType,
  }

  // 开发环境：输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: webVitalsMetric.name,
      value: Math.round(webVitalsMetric.value),
      rating: webVitalsMetric.rating,
    })
  }

  // 生产环境：发送到分析端点
  if (process.env.NODE_ENV === 'production') {
    // 使用 sendBeacon API 发送数据（不阻塞页面卸载）
    const body = JSON.stringify(webVitalsMetric)
    const url = '/api/analytics/web-vitals'

    // 优先使用 sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      // 降级到 fetch
      fetch(url, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send web vitals:', error)
      })
    }
  }

  // 发送到 Google Analytics（如果已配置）
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

/**
 * 获取性能指标的描述
 */
export function getMetricDescription(name: string): string {
  const descriptions: Record<string, string> = {
    CLS: 'Cumulative Layout Shift - 累积布局偏移',
    LCP: 'Largest Contentful Paint - 最大内容绘制',
    FCP: 'First Contentful Paint - 首次内容绘制',
    TTFB: 'Time to First Byte - 首字节时间',
    INP: 'Interaction to Next Paint - 交互到下次绘制',
    // FID 已被 INP 取代（保留以兼容旧数据）
    FID: 'First Input Delay - 首次输入延迟 (已弃用)',
  }
  return descriptions[name] || name
}

/**
 * 格式化性能指标值
 */
export function formatMetricValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3)
  }
  return `${Math.round(value)}ms`
}
