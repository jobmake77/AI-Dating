'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'
import { trackEvent } from '@/lib/analytics/events'

export async function toggleLike(contentId: string) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get content author
  const { data: content } = await supabase
    .from('contents')
    .select('author_id')
    .eq('id', contentId)
    .single()

  if (!content) {
    throw new Error('Content not found')
  }

  // Check if user already liked this content
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', user.id)
    .single()

  if (existingLike) {
    // Unlike: delete the like
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      throw new Error(`Failed to unlike: ${error.message}`)
    }

    // 追踪取消点赞事件
    await trackEvent('post_unliked', {
      content_id: contentId,
      user_id: user.id,
    })
  } else {
    // Like: insert a new like
    const { error } = await supabase
      .from('likes')
      .insert({
        content_id: contentId,
        user_id: user.id,
      })

    if (error) {
      throw new Error(`Failed to like: ${error.message}`)
    }

    // 追踪点赞事件
    await trackEvent('post_liked', {
      content_id: contentId,
      user_id: user.id,
      author_id: content.author_id,
    })

    // Create notification for content author
    try {
      await createNotification({
        userId: content.author_id,
        actorId: user.id,
        type: 'like',
        contentId: contentId,
      })
    } catch (error) {
      console.error('Failed to create like notification:', error)
      // Don't throw error, notification failure shouldn't block the like
    }
  }

  revalidatePath(`/post/${contentId}`)
  revalidatePath('/contents')
  revalidatePath('/')
}

export async function checkUserLiked(contentId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .single()

  return !!data
}
