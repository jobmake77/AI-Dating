'use server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import type { SearchResult } from '@/lib/types/search'

// Validation schemas
const searchQuerySchema = z.string().min(1, '搜索关键词不能为空').max(100, '搜索关键词过长')

const paginationSchema = z.object({
  page: z.number().int().min(1, '页码必须大于0'),
  limit: z.number().int().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100'),
})

export async function searchContents(query: string, page: number = 1, limit: number = 10) {
  // Validate input
  const queryValidation = searchQuerySchema.safeParse(query)
  if (!queryValidation.success) {
    return {
      contents: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const paginationValidation = paginationSchema.safeParse({ page, limit })
  if (!paginationValidation.success) {
    throw new Error(paginationValidation.error.issues[0].message)
  }

  const supabase = await createClient()

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
  // Validate input
  const queryValidation = searchQuerySchema.safeParse(query)
  if (!queryValidation.success) {
    return {
      users: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  const paginationValidation = paginationSchema.safeParse({ page, limit })
  if (!paginationValidation.success) {
    throw new Error(paginationValidation.error.issues[0].message)
  }

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

export async function searchAll(query: string): Promise<SearchResult> {
  const supabase = await createClient()

  if (!query || query.trim().length === 0) {
    return {
      contents: [],
      users: [],
      tags: [],
      total: 0,
    }
  }

  const searchQuery = query.trim().toLowerCase()

  // 并行搜索内容和用户
  const [contentsResult, usersResult, tagsResult] = await Promise.all([
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
    supabase
      .from('tags')
      .select('name, slug, usage_count')
      .or(`name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`)
      .order('usage_count', { ascending: false })
      .limit(10),
  ])

  return {
    contents: contentsResult.data || [],
    users: usersResult.data || [],
    tags: (tagsResult.data || []).map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      count: tag.usage_count || 0,
    })),
    total:
      (contentsResult.data?.length || 0) +
      (usersResult.data?.length || 0) +
      (tagsResult.data?.length || 0),
  }
}

export async function getPopularSearchTags(limit: number = 8) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('name, slug, usage_count')
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error('Get popular search tags error:', error)
    return []
  }

  return (data || []).map((tag) => ({
    name: tag.name,
    slug: tag.slug,
    count: tag.usage_count || 0,
  }))
}
