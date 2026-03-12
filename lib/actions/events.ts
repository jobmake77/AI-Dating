'use server'
import { logger } from '@/lib/utils/logger'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  start_time: z.string().min(1),
  end_time: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().optional(),
})

const eventIdSchema = z.string().uuid('无效的活动ID')

export async function createEvent(formData: FormData) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查是否管理员
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    const isAdmin = profile?.role === 'admin'

    const rawEndTime = formData.get('end_time')
    const rawDescription = formData.get('description')
    const rawCoverUrl = formData.get('cover_url')
    const rawType = formData.get('type') as string | null

    // 只有管理员可以创建 official 类型
    const eventType = isAdmin && rawType === 'official' ? 'official' : 'offline'

    const data = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      start_time: formData.get('start_time') as string,
      end_time: (typeof rawEndTime === 'string' && rawEndTime.trim()) || undefined,
      description: (typeof rawDescription === 'string' && rawDescription.trim()) || undefined,
      cover_url: (typeof rawCoverUrl === 'string' && rawCoverUrl.trim()) || undefined,
    }

    const validatedData = createEventSchema.parse(data)

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        type: eventType,
        creator_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('创建活动失败:', error)
      return { success: false, error: `创建活动失败: ${error.message}` }
    }

    revalidatePath('/events')
    return { success: true, data: event }
  } catch (error) {
    logger.error('创建活动错误:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: `表单验证失败: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
    }
    return { success: false, error: '创建活动失败' }
  }
}

export async function joinEvent(eventId: string) {
  // Validate input
  const validation = eventIdSchema.safeParse(eventId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: '请先登录' }

  const { error } = await supabase
    .from('event_participants')
    .insert({ event_id: eventId, user_id: user.id })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

export async function leaveEvent(eventId: string) {
  // Validate input
  const validation = eventIdSchema.safeParse(eventId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: '请先登录' }

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

// 活动签到
export async function checkInEvent(eventId: string) {
  // Validate input
  const validation = eventIdSchema.safeParse(eventId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查是否已参加活动
    const { data: participant } = await supabase
      .from('event_participants')
      .select('id, checked_in_at')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return { success: false, error: '你还未参加此活动' }
    }

    if (participant.checked_in_at) {
      return { success: false, error: '你已经签到过了' }
    }

    // 更新签到时间
    const { error } = await supabase
      .from('event_participants')
      .update({ checked_in_at: new Date().toISOString() })
      .eq('id', participant.id)

    if (error) {
      logger.error('签到失败:', error)
      return { success: false, error: '签到失败' }
    }

    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (error) {
    logger.error('签到错误:', error)
    return { success: false, error: '签到失败' }
  }
}

// 获取签到状态
export async function getCheckInStatus(eventId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { checkedIn: false, canCheckIn: false }
    }

    const { data: participant } = await supabase
      .from('event_participants')
      .select('checked_in_at')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (!participant) {
      return { checkedIn: false, canCheckIn: false }
    }

    return {
      checkedIn: !!participant.checked_in_at,
      canCheckIn: !participant.checked_in_at,
      checkedInAt: participant.checked_in_at
    }
  } catch (error) {
    logger.error('获取签到状态错误:', error)
    return { checkedIn: false, canCheckIn: false }
  }
}
