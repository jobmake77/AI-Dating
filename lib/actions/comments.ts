'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'
import { trackEvent } from '@/lib/analytics/events'
import { z } from 'zod'

// Validation schemas
const createCommentSchema = z.object({
  contentId: z.string().uuid('无效的内容ID'),
  content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容不能超过 1000 字符'),
  parentId: z.string().uuid('无效的父评论ID').optional(),
})

const deleteCommentSchema = z.object({
  commentId: z.string().uuid('无效的评论ID'),
  contentId: z.string().uuid('无效的内容ID'),
})

export async function createComment(contentId: string, content: string, parentId?: string) {
  // Validate input
  const validation = createCommentSchema.safeParse({ contentId, content, parentId })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get content author
  const { data: contentData } = await supabase
    .from('contents')
    .select('author_id')
    .eq('id', contentId)
    .is('deleted_at', null)
    .single()

  if (!contentData) {
    throw new Error('Content not found')
  }

  // Insert comment
  const { data: newComment, error } = await supabase
    .from('comments')
    .insert({
      content_id: contentId,
      user_id: user.id,
      content: content.trim(),
      ...(parentId ? { parent_id: parentId } : {}),
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`)
  }

  // 追踪评论事件
  await trackEvent('post_commented', {
    content_id: contentId,
    comment_id: newComment.id,
    user_id: user.id,
    is_reply: !!parentId,
  })

  // Create notification for content author
  try {
    await createNotification({
      userId: contentData.author_id,
      actorId: user.id,
      type: 'comment',
      contentId: contentId,
      commentId: newComment.id,
    })
  } catch (error) {
    console.error('Failed to create comment notification:', error)
    // Don't throw error, notification failure shouldn't block the comment
  }

  revalidatePath(`/post/${contentId}`)
}

export async function deleteComment(commentId: string, contentId: string) {
  // Validate input
  const validation = deleteCommentSchema.safeParse({ commentId, contentId })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Soft delete comment (RLS ensures user owns the comment)
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`)
  }

  revalidatePath(`/post/${contentId}`)
}
