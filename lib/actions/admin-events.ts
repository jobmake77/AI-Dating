'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/middleware/admin'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

const adminEventSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(2, '活动标题至少 2 个字符').max(100, '活动标题过长'),
    location: z.string().trim().min(2, '活动地点至少 2 个字符').max(200, '活动地点过长'),
    startTime: z.string().min(1, '开始时间不能为空'),
    endTime: z.string().optional(),
    description: z.string().trim().max(2000, '活动描述过长').optional(),
    coverUrl: z.string().trim().url('封面链接格式不正确').optional().or(z.literal('')),
    type: z.enum(['official', 'offline']),
    status: z.enum(['active', 'cancelled', 'ended']),
  })
  .refine(
    (value) => !value.endTime || new Date(value.endTime).getTime() >= new Date(value.startTime).getTime(),
    {
      message: '结束时间不能早于开始时间',
      path: ['endTime'],
    }
  )

const deleteEventSchema = z.object({
  eventId: z.string().uuid('无效的活动 ID'),
})

function normalizeDateTime(value: string) {
  return new Date(value).toISOString()
}

function revalidateEventPaths(eventId?: string) {
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/events/[id]', 'page')

  if (eventId) {
    revalidatePath(`/events/${eventId}`)
  }
}

export async function saveAdminEvent(formData: FormData) {
  const adminUser = await requireAdmin()

  const validation = adminEventSchema.safeParse({
    id: formData.get('id')?.toString().trim() || undefined,
    title: formData.get('title')?.toString() || '',
    location: formData.get('location')?.toString() || '',
    startTime: formData.get('start_time')?.toString() || '',
    endTime: formData.get('end_time')?.toString() || undefined,
    description: formData.get('description')?.toString() || undefined,
    coverUrl: formData.get('cover_url')?.toString().trim() || '',
    type: formData.get('type')?.toString() === 'official' ? 'official' : 'offline',
    status: formData.get('status')?.toString() === 'cancelled'
      ? 'cancelled'
      : formData.get('status')?.toString() === 'ended'
        ? 'ended'
        : 'active',
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '活动数据不合法')
  }

  const supabase = await createClient()
  const payload = {
    title: validation.data.title,
    location: validation.data.location,
    start_time: normalizeDateTime(validation.data.startTime),
    end_time: validation.data.endTime ? normalizeDateTime(validation.data.endTime) : null,
    description: validation.data.description || null,
    cover_url: validation.data.coverUrl || null,
    type: validation.data.type,
    status: validation.data.status,
    updated_at: new Date().toISOString(),
  }

  if (validation.data.id) {
    const { error: updateError } = await supabase
      .from('events')
      .update(payload)
      .eq('id', validation.data.id)

    if (updateError) {
      logger.error('Failed to update event:', updateError)
      throw new Error(updateError.message)
    }

    revalidateEventPaths(validation.data.id)
    return
  }

  const { data: createdEvent, error: insertError } = await supabase
    .from('events')
    .insert({
      ...payload,
      creator_id: adminUser.id,
    })
    .select('id')
    .single()

  if (insertError || !createdEvent) {
    logger.error('Failed to create admin event:', insertError)
    throw new Error(insertError?.message || '创建活动失败')
  }

  revalidateEventPaths(createdEvent.id)
}

export async function deleteAdminEvent(formData: FormData) {
  await requireAdmin()

  const validation = deleteEventSchema.safeParse({
    eventId: formData.get('event_id')?.toString(),
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '删除参数不合法')
  }

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .eq('id', validation.data.eventId)

  if (deleteError) {
    logger.error('Failed to delete event:', deleteError)
    throw new Error(deleteError.message)
  }

  revalidateEventPaths(validation.data.eventId)
}
