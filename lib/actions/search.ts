'use server'
import { logger } from '@/lib/utils/logger'

import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  contents: any[]
  users: any[]
  total: number
}

export async function searchContents(query: string, page: number = 1, limit: number = 10) {
  const supabase = await createClient()

  if (!query || query.trim().length === 0) {
    return {
      contents: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const searchQuery = query.trim().toLowerCase()

  // 搜索内容：标题、摘要、标签
  const { data, error, count } = await supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar,
        full_name
      )
    `, { count: 'exact' })
    .eq('status', 'approved')
    .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    logger.error('Search contents error:', error)
    throw new Error('搜索失败')
  }

  return {
    contents: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function searchUsers(query: string, page: number = 1, limit: number = 10) {
  const supabase = await createClient()

  if (!query || query.trim().length === 0) {
    return {
      users: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const searchQuery = query.trim().toLowerCase()

  // 搜索用户：用户名、全名、简介
  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) {
    logger.error('Search users error:', error)
    throw new Error('搜索失败')
  }

  return {
    users: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function searchAll(query: string) {
  const supabase = await createClient()

  if (!query || query.trim().length === 0) {
    return {
      contents: [],
      users: [],
      total: 0,
    }
  }

  const searchQuery = query.trim().toLowerCase()

  // 并行搜索内容和用户
  const [contentsResult, usersResult] = await Promise.all([
    supabase
      .from('contents')
      .select(`
        *,
        users:author_id (
          id,
          username,
          avatar,
          full_name
        )
      `)
      .eq('status', 'approved')
      .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    contents: contentsResult.data || [],
    users: usersResult.data || [],
    total: (contentsResult.data?.length || 0) + (usersResult.data?.length || 0),
  }
}
