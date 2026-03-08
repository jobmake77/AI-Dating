'use client'

import { AnalyticsEvent, BaseEventParams, EVENT_CATEGORY_MAP } from './types'

/**
 * 客户端事件追踪（用于 Google Analytics）
 * 这个函数应该在客户端组件中调用
 */
export function trackEventClient(
  eventName: AnalyticsEvent,
  params: BaseEventParams = {}
): void {
  try {
    // 检查 gtag 是否可用
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const category = EVENT_CATEGORY_MAP[eventName]

      ;(window as any).gtag('event', eventName, {
        event_category: category,
        ...params,
      })
    }
  } catch (error) {
    // 客户端错误静默处理，避免影响用户体验
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking event to GA:', error)
    }
  }
}
