'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const createEventSchema = z.object({
  title: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  start_time: z.string().min(1),
  end_time: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().optional(),
})

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
      console.error('创建活动失败:', error)
      return { success: false, error: `创建活动失败: ${error.message}` }
    }

    revalidatePath('/events')
    return { success: true, data: event }
  } catch (error) {
    console.error('创建活动错误:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: `表单验证失败: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
    }
    return { success: false, error: '创建活动失败' }
  }
}
