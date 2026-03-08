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

    // 存储性能数据
    const { error } = await supabase.from('performance_metrics').insert({
      user_id: user?.id,
      page_url: body.page.url,
      referrer: body.page.referrer,
      user_agent: userAgent,
      ip_address: ipAddress,
      // 导航时间
      dns_time: body.navigationTiming.dns,
      tcp_time: body.navigationTiming.tcp,
      request_time: body.navigationTiming.request,
      response_time: body.navigationTiming.response,
      dom_processing_time: body.navigationTiming.domProcessing,
      dom_content_loaded_time: body.navigationTiming.domContentLoaded,
      load_complete_time: body.navigationTiming.loadComplete,
      ttfb: body.navigationTiming.ttfb,
      // 资源加载
      resource_count: body.resources.count,
      total_resource_size: body.resources.totalSize,
      total_resource_duration: body.resources.totalDuration,
      resources_by_type: body.resources.byType,
      // 内存使用
      memory_used: body.memory?.usedJSHeapSize,
      memory_total: body.memory?.totalJSHeapSize,
      memory_limit: body.memory?.jsHeapSizeLimit,
    })

    if (error) {
      logger.error('Failed to store performance metrics', error)
      return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error processing performance metrics', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
