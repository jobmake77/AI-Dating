'use client'

import { useEffect } from 'react'
import { onCLS, onLCP, onFCP, onTTFB, onINP } from 'web-vitals'
import { sendToAnalytics } from '@/lib/analytics/web-vitals'
import { initPerformanceMonitoring } from '@/lib/analytics/performance'

/**
 * Web Vitals 报告组件
 * 自动追踪和报告 Core Web Vitals
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // 追踪 Core Web Vitals
    // 注意: FID 已被 INP 取代（web-vitals v4+）
    onCLS(sendToAnalytics)
    onLCP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics)

    // 初始化性能监控
    initPerformanceMonitoring()
  }, [])

  return null
}
