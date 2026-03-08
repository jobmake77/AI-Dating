import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EVENT_CATEGORY_MAP, AnalyticsEvent } from '@/lib/analytics/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_name, event_params } = body

    if (!event_name || !EVENT_CATEGORY_MAP[event_name as AnalyticsEvent]) {
      return NextResponse.json(
        { error: 'Invalid event name' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 获取请求信息
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined

    // 插入事件到数据库
    const { error } = await supabase.from('analytics_events').insert({
      event_name,
      event_category: EVENT_CATEGORY_MAP[event_name as AnalyticsEvent],
      user_id: user?.id,
      event_params: event_params || {},
      user_agent: userAgent,
      ip_address: ipAddress,
      referrer: referrer,
    })

    if (error) {
      console.error('Failed to track event:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
