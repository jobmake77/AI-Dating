'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/middleware/admin'

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

  // Log moderation action
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('moderation_logs').insert({
    content_id: contentId,
    moderator_id: user!.id,
    action: 'approve',
  })

  revalidatePath('/admin/moderation')
  revalidatePath('/')
  revalidatePath('/contents')
}

export async function rejectContent(contentId: string, reason: string) {
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

  // Log moderation action
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('moderation_logs').insert({
    content_id: contentId,
    moderator_id: user!.id,
    action: 'reject',
    reason,
  })

  revalidatePath('/admin/moderation')
  revalidatePath('/')
  revalidatePath('/contents')
}

