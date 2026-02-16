'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'

export async function createComment(contentId: string, content: string) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error('评论内容不能为空')
  }

  if (content.length > 1000) {
    throw new Error('评论内容不能超过 1000 字符')
  }

  // Get content author
  const { data: contentData } = await supabase
    .from('contents')
    .select('author_id')
    .eq('id', contentId)
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
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`)
  }

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
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Delete comment (RLS ensures user owns the comment)
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`)
  }

  revalidatePath(`/post/${contentId}`)
}
