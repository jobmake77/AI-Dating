'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/middleware/admin'

export async function approveContent(contentId: string) {
  await requireAdmin()

  const supabase = await createClient()

  // Update content status
  const { error } = await supabase
    .from('contents')
    .update({ status: 'approved' })
    .eq('id', contentId)

  if (error) {
    throw new Error(`Failed to approve content: ${error.message}`)
  }

  // Log moderation action
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('moderation_logs').insert({
    content_id: contentId,
    moderator_id: user!.id,
    action: 'approved',
  })

  revalidatePath('/admin/contents')
}

export async function rejectContent(contentId: string, reason: string) {
  await requireAdmin()

  const supabase = await createClient()

  // Update content status
  const { error } = await supabase
    .from('contents')
    .update({
      status: 'rejected',
      rejection_reason: reason,
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
    action: 'rejected',
    reason,
  })

  revalidatePath('/admin/contents')
}
