'use server'

import { createClient } from '@/lib/supabase/server'
import type { ContentListItem } from '@/lib/types/content'
import { logger } from '@/lib/utils/logger'
import { normalizeSingleRelation } from '@/lib/utils/normalize'
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

type BookmarkAuthor = {
  id: string
  username: string
  avatar: string | null
  full_name: string | null
}

type BookmarkedContentRow = {
  id: string
  title: string
  excerpt: string
  tags: string[] | null
  category?: string | null
  price_type: string
  reading_time?: number | null
  view_count: number
  likes_count: number
  reposts_count: number
  comments_count: number
  created_at: string
  users: BookmarkAuthor | BookmarkAuthor[] | null
}

type BookmarkWithContent = {
  contents: BookmarkedContentRow | BookmarkedContentRow[] | null
}

export async function getUserBookmarkedContents(userId: string, params: { page?: number; limit?: number } = {}) {
  try {
    const supabase = await createClient()
    const { page = 1, limit = 12 } = params
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        contents (
          id,
          title,
          excerpt,
          tags,
          category,
          price_type,
          reading_time,
          view_count,
          likes_count,
          reposts_count,
          comments_count,
          created_at,
          users:author_id (
            id,
            username,
            avatar,
            full_name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('contents.status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      logger.warn('Failed to fetch bookmarked contents, returning empty result:', error)
      return { contents: [], totalPages: 0, total: 0, page, limit }
    }

    const contents = (data || [])
      .map((bookmark: BookmarkWithContent) => normalizeSingleRelation(bookmark.contents))
      .filter((content): content is BookmarkedContentRow => Boolean(content))
      .map((content): ContentListItem | null => {
        const normalizedUser = normalizeSingleRelation(content.users)

        if (!normalizedUser) {
          return null
        }

        return {
          ...content,
          excerpt: content.excerpt || '',
          reading_time: content.reading_time ?? 0,
          users: normalizedUser,
        }
      })
      .filter((content): content is ContentListItem => Boolean(content))

    return {
      contents,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    logger.warn('Failed to fetch bookmarked contents, returning empty result:', error)
    return { contents: [], totalPages: 0, total: 0, page: 1, limit: params.limit || 12 }
  }
}
