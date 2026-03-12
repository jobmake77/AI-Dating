'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const toggleBookmarkSchema = z.object({
  contentId: z.string().uuid(),
})

export async function toggleBookmark(contentId: string) {
  try {
    const validated = toggleBookmarkSchema.parse({ contentId })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', validated.contentId)
      .single()

    if (existing) {
      // 取消收藏
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, content_id: validated.contentId })

      if (error) throw error
    }

    revalidatePath('/post/[id]', 'page')
    return { success: true, isBookmarked: !existing }
  } catch (error) {
    console.error('Toggle bookmark error:', error)
    return { success: false, error: 'Failed to toggle bookmark' }
  }
}

export async function checkUserBookmarked(contentId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single()

    return !!data
  } catch (error) {
    console.error('Check bookmark error:', error)
    return false
  }
}

export async function getUserBookmarks(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        content:contents (
          id,
          title,
          content,
          created_at,
          view_count,
          like_count,
          comment_count,
          author:users (
            id,
            username,
            full_name,
            avatar
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get user bookmarks error:', error)
    return { data: null, error: 'Failed to fetch bookmarks' }
  }
}
