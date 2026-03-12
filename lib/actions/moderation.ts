'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/middleware/admin'
import { z } from 'zod'

// Validation schemas
const contentIdSchema = z.string().uuid('无效的内容ID')

const rejectContentSchema = z.object({
  contentId: z.string().uuid('无效的内容ID'),
  reason: z.string().min(1, '拒绝原因不能为空').max(500, '拒绝原因过长'),
})

/**
 * 获取待审核内容列表
 */
export async function getPendingContents() {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        username,
        avatar,
        full_name
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get pending contents: ${error.message}`)
  }

  return data
}

/**
 * 获取审核统计
 */
export async function getModerationStats() {
  await requireAdmin()

  const supabase = await createClient()

  const { count: pendingCount } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: approvedCount } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: rejectedCount } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  return {
    pending: pendingCount || 0,
    approved: approvedCount || 0,
    rejected: rejectedCount || 0,
  }
}

export async function approveContent(contentId: string) {
  // Validate input
  const validation = contentIdSchema.safeParse(contentId)
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  await requireAdmin()

  const supabase = await createClient()

  // Update content status
  const { error } = await supabase
    .from('contents')
    .update({
      status: 'approved',
      reject_reason: null,
    })
    .eq('id', contentId)

  if (error) {
    throw new Error(`Failed to approve content: ${error.message}`)
  }

  // Log moderation action（忽略失败，不影响主流程）
  const { data: { user } } = await supabase.auth.getUser()
  try {
    await supabase.from('moderation_logs').insert({
      content_id: contentId,
      moderator_id: user!.id,
      action: 'approve',
    })
  } catch {
    // moderation_logs 表不存在时忽略
  }

  revalidatePath('/admin/moderation')
  revalidatePath('/')
  revalidatePath('/contents')
}

export async function rejectContent(contentId: string, reason: string) {
  // Validate input
  const validation = rejectContentSchema.safeParse({ contentId, reason })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  await requireAdmin()

  const supabase = await createClient()

  // Update content status
  const { error } = await supabase
    .from('contents')
    .update({
      status: 'rejected',
      reject_reason: reason,
    })
    .eq('id', contentId)

  if (error) {
    throw new Error(`Failed to reject content: ${error.message}`)
  }

  // Log moderation action（忽略失败，不影响主流程）
  const { data: { user } } = await supabase.auth.getUser()
  try {
    await supabase.from('moderation_logs').insert({
      content_id: contentId,
      moderator_id: user!.id,
      action: 'reject',
      reason,
    })
  } catch {
    // moderation_logs 表不存在时忽略
  }

  revalidatePath('/admin/moderation')
  revalidatePath('/')
  revalidatePath('/contents')
}

