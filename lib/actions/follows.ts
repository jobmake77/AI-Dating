'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createNotification } from './notifications'

export async function toggleFollow(userId: string) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Can't follow yourself
  if (user.id === userId) {
    throw new Error('不能关注自己')
  }

  // Check if already following
  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single()

  if (existingFollow) {
    // Unfollow: delete the follow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', existingFollow.id)

    if (error) {
      throw new Error(`Failed to unfollow: ${error.message}`)
    }
  } else {
    // Follow: insert a new follow
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: userId,
      })

    if (error) {
      throw new Error(`Failed to follow: ${error.message}`)
    }

    // Create notification for the followed user
    try {
      await createNotification({
        userId: userId,
        actorId: user.id,
        type: 'follow',
      })
    } catch (error) {
      console.error('Failed to create follow notification:', error)
      // Don't throw error, notification failure shouldn't block the follow
    }
  }

  revalidatePath(`/u/${userId}`)
}

export async function checkUserFollowing(userId: string, currentUserId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', currentUserId)
    .eq('following_id', userId)
    .single()

  return !!data
}

export async function getFollowers(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      follower:follower_id (
        id,
        username,
        full_name,
        avatar,
        bio
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch followers:', error)
    return []
  }

  return data
}

export async function getFollowing(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('follows')
    .select(`
      id,
      created_at,
      following:following_id (
        id,
        username,
        full_name,
        avatar,
        bio
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch following:', error)
    return []
  }

  return data
}
