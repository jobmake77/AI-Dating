'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import {
  AnalyticsEvent,
  BaseEventParams,
  EVENT_CATEGORY_MAP,
  AnalyticsEventData,
} from './types'
import { logger } from '@/lib/utils/logger'

/**
 * 追踪事件到数据库和 Google Analytics
 * @param eventName 事件名称
 * @param params 事件参数
 */
export async function trackEvent(
  eventName: AnalyticsEvent,
  params: BaseEventParams = {}
): Promise<void> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 获取请求头信息
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || undefined
    const referrer = headersList.get('referer') || undefined
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined

    // 构建事件数据
    const eventData: AnalyticsEventData = {
      event_name: eventName,
      event_category: EVENT_CATEGORY_MAP[eventName],
      user_id: user?.id,
      event_params: params,
      user_agent: userAgent,
      ip_address: ipAddress,
      referrer: referrer,
    }

    // 存储到数据库（使用 service role 绕过 RLS）
    const { error: dbError } = await supabase.from('analytics_events').insert({
      event_name: eventData.event_name,
      event_category: eventData.event_category,
      user_id: eventData.user_id,
      event_params: eventData.event_params || {},
      user_agent: eventData.user_agent,
      ip_address: eventData.ip_address,
      referrer: eventData.referrer,
    })

    if (dbError) {
      logger.error('Failed to track event to database', dbError)
    }

    // 注意：Google Analytics 事件追踪在客户端进行
    // 这里只负责服务端的数据库记录
  } catch (error) {
    logger.error('Error tracking event', error)
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 批量追踪事件
 * @param events 事件数组
 */
export async function trackEvents(
  events: Array<{ eventName: AnalyticsEvent; params?: BaseEventParams }>
): Promise<void> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 获取请求头信息
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || undefined
    const referrer = headersList.get('referer') || undefined
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined

    // 构建批量插入数据
    const eventDataArray = events.map((event) => ({
      event_name: event.eventName,
      event_category: EVENT_CATEGORY_MAP[event.eventName],
      user_id: user?.id,
      event_params: event.params || {},
      user_agent: userAgent,
      ip_address: ipAddress,
      referrer: referrer,
    }))

    // 批量插入到数据库
    const { error: dbError } = await supabase
      .from('analytics_events')
      .insert(eventDataArray)

    if (dbError) {
      logger.error('Failed to track events to database', dbError)
    }
  } catch (error) {
    logger.error('Error tracking events', error)
  }
}

/**
 * 追踪页面浏览
 * @param pageUrl 页面 URL
 * @param pageTitle 页面标题
 */
export async function trackPageView(
  pageUrl: string,
  pageTitle?: string
): Promise<void> {
  void pageUrl
  void pageTitle
  // 页面浏览由 Google Analytics 自动追踪
  // 这里可以添加额外的自定义逻辑
}
