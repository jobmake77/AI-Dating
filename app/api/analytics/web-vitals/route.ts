import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // 获取当前用户（可选）
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 获取请求信息
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined

    // 存储 Web Vitals 数据
    const { error } = await supabase.from('web_vitals').insert({
      user_id: user?.id,
      metric_name: body.name,
      metric_value: body.value,
      metric_rating: body.rating,
      metric_delta: body.delta,
      metric_id: body.id,
      navigation_type: body.navigationType,
      page_url: request.headers.get('referer') || undefined,
      user_agent: userAgent,
      ip_address: ipAddress,
    })

    if (error) {
      logger.error('Failed to store web vitals', error)
      return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error processing web vitals', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
