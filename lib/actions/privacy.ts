'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database.types'

const userIdSchema = z.string().uuid('无效的用户ID')

async function ensureCurrentUser(userId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || user.id !== userId) {
    throw new Error('未授权访问')
  }

  return supabase
}

export async function performAccountDeletion(
  userId: string,
  suppliedClient?: Awaited<ReturnType<typeof createClient>>
) {
  const supabase = suppliedClient || (await createClient())
  const deletedAt = new Date().toISOString()
  const anonymousUsername = `deleted_user_${userId.substring(0, 8)}`

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      username: anonymousUsername,
      full_name: '已删除用户',
      bio: null,
      avatar: null,
      github_url: null,
      github_username: null,
      deleted_at: deletedAt,
      updated_at: deletedAt,
    })
    .eq('id', userId)

  if (userUpdateError) {
    throw new Error(`更新用户信息失败: ${userUpdateError.message}`)
  }

  const { error: contentUpdateError } = await supabase
    .from('contents')
    .update({
      title: '[已删除]',
      content: '[此内容已被作者删除]',
      excerpt: '[此内容已被作者删除]',
      deleted_at: deletedAt,
      updated_at: deletedAt,
    })
    .eq('author_id', userId)

  if (contentUpdateError) {
    throw new Error(`更新内容失败: ${contentUpdateError.message}`)
  }

  const { error: commentUpdateError } = await supabase
    .from('comments')
    .update({
      content: '[已删除]',
      deleted_at: deletedAt,
      updated_at: deletedAt,
    })
    .eq('user_id', userId)

  if (commentUpdateError) {
    throw new Error(`更新评论失败: ${commentUpdateError.message}`)
  }
}

export async function exportUserData(userId: string): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const validation = userIdSchema.safeParse(userId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await ensureCurrentUser(userId)

    const { data: existingRequests, error: existingError } = await supabase
      .from('data_export_requests')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('requested_at', { ascending: false })
      .limit(1)

    if (existingError) {
      throw existingError
    }

    if ((existingRequests || []).length > 0) {
      return { success: false, error: '已有处理中的数据导出请求，请等待后台完成后再试。' }
    }

    const { data: request, error: insertError } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !request) {
      throw insertError || new Error('创建导出请求失败')
    }

    revalidatePath('/settings/privacy')
    revalidatePath('/admin/privacy-requests')

    return { success: true, requestId: request.id }
  } catch (error) {
    console.error('Error creating export request:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '提交导出请求失败',
    }
  }
}

export async function requestAccountDeletion(
  userId: string,
  reason?: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const validation = userIdSchema.safeParse(userId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await ensureCurrentUser(userId)

    const { data: existingRequests, error: existingError } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('requested_at', { ascending: false })
      .limit(1)

    if (existingError) {
      throw existingError
    }

    if ((existingRequests || []).length > 0) {
      return { success: false, error: '已有待处理的注销请求，请等待后台处理。' }
    }

    const { data: request, error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        reason: reason || null,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !request) {
      throw insertError || new Error('创建注销请求失败')
    }

    revalidatePath('/settings/privacy')
    revalidatePath('/admin/privacy-requests')

    return { success: true, requestId: request.id }
  } catch (error) {
    console.error('Error requesting account deletion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建删除请求失败',
    }
  }
}

export async function getUserPrivacyRequestSummary(userId: string): Promise<{
  success: boolean
  data?: {
    latestExportRequest: Tables<'data_export_requests'> | null
    latestDeletionRequest: Tables<'account_deletion_requests'> | null
  }
  error?: string
}> {
  const validation = userIdSchema.safeParse(userId)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  try {
    const supabase = await ensureCurrentUser(userId)

    const [{ data: latestExportRequest, error: exportError }, { data: latestDeletionRequest, error: deletionError }] =
      await Promise.all([
        supabase
          .from('data_export_requests')
          .select('*')
          .eq('user_id', userId)
          .order('requested_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('account_deletion_requests')
          .select('*')
          .eq('user_id', userId)
          .order('requested_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

    if (exportError) {
      throw exportError
    }

    if (deletionError) {
      throw deletionError
    }

    return {
      success: true,
      data: {
        latestExportRequest: latestExportRequest || null,
        latestDeletionRequest: latestDeletionRequest || null,
      },
    }
  } catch (error) {
    console.error('Error loading privacy request summary:', error)
    return { success: false, error: '获取隐私请求状态失败' }
  }
}

export async function getUserPrivacySettings(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return {
      success: true,
      data: data || {
        user_id: userId,
        profile_visibility: 'public',
        show_email: false,
        show_location: false,
        allow_messages: true,
        allow_notifications: true,
      },
    }
  } catch (error) {
    console.error('Error getting privacy settings:', error)
    return { success: false, error: '获取隐私设置失败' }
  }
}

export async function updateUserPrivacySettings(
  userId: string,
  settings: {
    profile_visibility?: 'public' | 'private' | 'followers_only'
    show_email?: boolean
    show_location?: boolean
    allow_messages?: boolean
    allow_notifications?: boolean
  }
) {
  try {
    const supabase = await ensureCurrentUser(userId)

    const { error } = await supabase.from('user_privacy_settings').upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    revalidatePath('/settings/privacy')

    return { success: true }
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新隐私设置失败',
    }
  }
}
