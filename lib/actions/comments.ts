'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

  // Insert comment
  const { error } = await supabase
    .from('comments')
    .insert({
      content_id: contentId,
      user_id: user.id,
      content: content.trim(),
    })

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`)
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
