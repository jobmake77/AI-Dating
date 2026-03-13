'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export interface DraftData {
  title?: string
  content: string
  excerpt?: string
  cover_image?: string
  price_type?: 'free'
  tags?: string[]
}

// Validation schema
const draftDataSchema = z.object({
  title: z.string().max(200, '标题过长').optional(),
  content: z.string().min(1, '内容不能为空').max(100000, '内容过长'),
  excerpt: z.string().max(500, '摘要过长').optional(),
  cover_image: z.string().url('无效的封面图片URL').optional(),
  price_type: z.literal('free').optional(),
  tags: z.array(z.string().max(50, '标签过长')).max(10, '标签数量不能超过10个').optional(),
})

/**
 * Save or update draft
 */
export async function saveDraft(data: DraftData) {
  // Validate input
  const validation = draftDataSchema.safeParse(data)
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if draft exists
  const { data: existingDraft } = await supabase
    .from('content_drafts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingDraft) {
    // Update existing draft
    const { error } = await supabase
      .from('content_drafts')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    return { success: true, id: existingDraft.id }
  } else {
    // Create new draft
    const { data: newDraft, error } = await supabase
      .from('content_drafts')
      .insert({
        user_id: user.id,
        ...data,
      })
      .select('id')
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, id: newDraft.id }
  }
}

/**
 * Get user's draft
 */
export async function getDraft() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No draft found
      return { data: null }
    }
    return { error: error.message }
  }

  return { data }
}

/**
 * Delete draft
 */
export async function deleteDraft() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('content_drafts')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Publish draft as content
 */
export async function publishDraft() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get draft
  const { data: draft, error: draftError } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (draftError || !draft) {
    return { error: 'Draft not found' }
  }

  // Create content from draft
  const { createContent } = await import('./content')

  const formData = new FormData()
  formData.append('content', draft.content)
  formData.append('price_type', 'free')
  if (draft.cover_image) {
    formData.append('cover_image', draft.cover_image)
  }
  if (draft.tags && draft.tags.length > 0) {
    formData.append('tags', JSON.stringify(draft.tags))
  }

  try {
    await createContent(formData)

    // Delete draft after successful publish
    await deleteDraft()

    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to publish' }
  }
}
