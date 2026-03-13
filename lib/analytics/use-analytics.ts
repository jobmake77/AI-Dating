'use client'

import { useCallback } from 'react'
import { AnalyticsEvent, BaseEventParams, EVENT_CATEGORY_MAP } from './types'

type WindowWithGtag = Window & {
  gtag?: (action: 'event', eventName: string, params?: Record<string, unknown>) => void
}

/**
 * 客户端事件追踪 Hook
 * 用于在客户端组件中追踪事件到 Google Analytics
 */
export function useAnalytics() {
  const trackEvent = useCallback(
    (eventName: AnalyticsEvent, params: BaseEventParams = {}) => {
      try {
        // 检查 gtag 是否可用
        const windowWithGtag = window as WindowWithGtag
        if (windowWithGtag.gtag) {
          const category = EVENT_CATEGORY_MAP[eventName]

          windowWithGtag.gtag('event', eventName, {
            event_category: category,
            ...params,
          })
        }

        // 同时发送到服务端进行数据库记录
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_name: eventName,
            event_params: params,
          }),
        }).catch((error) => {
          console.error('Failed to track event to server:', error)
        })
      } catch (error) {
        console.error('Error tracking event:', error)
      }
    },
    []
  )

  const trackPageView = useCallback((pageUrl: string, pageTitle?: string) => {
    try {
      const windowWithGtag = window as WindowWithGtag
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'page_view', {
          page_path: pageUrl,
          page_title: pageTitle,
        })
      }
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }, [])

  return {
    trackEvent,
    trackPageView,
  }
}
