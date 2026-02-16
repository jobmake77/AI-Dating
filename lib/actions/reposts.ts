'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'

export async function toggleRepost(contentId: string) {
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

  // Check if user already reposted this content
  const { data: existingRepost } = await supabase
    .from('reposts')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', user.id)
    .single()

  if (existingRepost) {
    // Undo repost: delete the repost
    const { error } = await supabase
      .from('reposts')
      .delete()
      .eq('id', existingRepost.id)

    if (error) {
      throw new Error(`Failed to undo repost: ${error.message}`)
    }
  } else {
    // Repost: insert a new repost
    const { error } = await supabase
      .from('reposts')
      .insert({
        content_id: contentId,
        user_id: user.id,
      })

    if (error) {
      throw new Error(`Failed to repost: ${error.message}`)
    }

    // Create notification for content author
    try {
      await createNotification({
        userId: content.author_id,
        actorId: user.id,
        type: 'repost',
        contentId: contentId,
      })
    } catch (error) {
      console.error('Failed to create repost notification:', error)
      // Don't throw error, notification failure shouldn't block the repost
    }
  }

  revalidatePath(`/post/${contentId}`)
  revalidatePath('/contents')
  revalidatePath('/')
}
}

export async function checkUserReposted(contentId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reposts')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .single()

  return !!data
}
