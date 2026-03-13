/**
 * 数据库查询缓存工具
 * 为 Supabase 查询提供缓存层
 */

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import type { Tables } from '@/types/database.types'
import {
  getCached,
  setCached,
  buildCacheKey,
  CACHE_PREFIX,
  CACHE_TTL,
  cacheInvalidation,
} from './redis'

export interface QueryCacheOptions {
  ttl?: number
  prefix?: string
  key: string
}

type QueryResult<T> = {
  data: T | null
  error: PostgrestError | null
  cached?: boolean
}

type SearchFilters = Record<string, string | number | boolean | null>
type CachedContentRow = Record<string, unknown>
type CachedUserStats = {
  contentsCount: number
  followersCount: number
  followingCount: number
}

/**
 * 缓存 Supabase 查询结果
 */
export async function cachedQuery<T>(
  queryFn: () => Promise<QueryResult<T>>,
  options: QueryCacheOptions
): Promise<QueryResult<T>> {
  const { ttl = CACHE_TTL.DYNAMIC, prefix = CACHE_PREFIX.QUERY, key } = options

  const cacheKey = buildCacheKey(prefix, key)

  // 尝试从缓存获取
  const cached = await getCached<T>(cacheKey)
  if (cached !== null) {
    return { data: cached, error: null, cached: true }
  }

  // 执行查询
  const result = await queryFn()

  // 如果查询成功，缓存结果
  if (!result.error && result.data !== null) {
    await setCached(cacheKey, result.data, ttl)
  }

  return { ...result, cached: false }
}

/**
 * 内容查询缓存
 */
export const contentCache = {
  /**
   * 获取单个内容
   */
  async getContent(
    supabase: SupabaseClient,
    contentId: string
  ): Promise<QueryResult<CachedContentRow>> {
    return cachedQuery(
      async () => {
        const { data, error } = await supabase
          .from('contents')
          .select('*, users(*), tags(*)')
          .eq('id', contentId)
          .single()

        return { data, error }
      },
      {
        key: `content:${contentId}`,
        prefix: CACHE_PREFIX.CONTENT,
        ttl: CACHE_TTL.STATIC,
      }
    )
  },

  /**
   * 获取热门内容
   */
  async getTrending(
    supabase: SupabaseClient,
    limit: number = 10
  ): Promise<QueryResult<CachedContentRow[]>> {
    return cachedQuery(
      async () => {
        const { data, error } = await supabase
          .from('contents')
          .select('*, users(*), tags(*)')
          .order('views', { ascending: false })
          .limit(limit)

        return { data, error }
      },
      {
        key: `trending:${limit}`,
        prefix: CACHE_PREFIX.TRENDING,
        ttl: CACHE_TTL.TRENDING,
      }
    )
  },

  /**
   * 失效内容缓存
   */
  async invalidate(contentId: string) {
    await cacheInvalidation.invalidateContent(contentId)
  },
}

/**
 * 用户查询缓存
 */
export const userCache = {
  /**
   * 获取用户信息
   */
  async getUser(
    supabase: SupabaseClient,
    userId: string
  ): Promise<QueryResult<Tables<'users'>>> {
    return cachedQuery(
      async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        return { data, error }
      },
      {
        key: `user:${userId}`,
        prefix: CACHE_PREFIX.USER,
        ttl: CACHE_TTL.USER,
      }
    )
  },

  /**
   * 获取用户统计
   */
  async getUserStats(
    supabase: SupabaseClient,
    userId: string
  ): Promise<QueryResult<CachedUserStats>> {
    return cachedQuery(
      async () => {
        const [contents, followers, following] = await Promise.all([
          supabase.from('contents').select('id', { count: 'exact' }).eq('author_id', userId),
          supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
          supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
        ])

        return {
          data: {
            contentsCount: contents.count || 0,
            followersCount: followers.count || 0,
            followingCount: following.count || 0,
          },
          error: null,
        }
      },
      {
        key: `user:stats:${userId}`,
        prefix: CACHE_PREFIX.USER,
        ttl: CACHE_TTL.USER,
      }
    )
  },

  /**
   * 失效用户缓存
   */
  async invalidate(userId: string) {
    await cacheInvalidation.invalidateUser(userId)
  },
}

/**
 * 搜索查询缓存
 */
export const searchCache = {
  /**
   * 缓存搜索结果
   */
  async search(
    supabase: SupabaseClient,
    query: string,
    filters: SearchFilters = {}
  ): Promise<QueryResult<CachedContentRow[]>> {
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')

    return cachedQuery(
      async () => {
        let queryBuilder = supabase
          .from('contents')
          .select('*, users(*), tags(*)')
          .ilike('title', `%${query}%`)

        // 应用过滤器
        Object.entries(filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value)
        })

        const { data, error } = await queryBuilder

        return { data, error }
      },
      {
        key: `search:${query}:${filterKey}`,
        prefix: CACHE_PREFIX.SEARCH,
        ttl: CACHE_TTL.SEARCH,
      }
    )
  },

  /**
   * 失效搜索缓存
   */
  async invalidate() {
    await cacheInvalidation.invalidateSearch()
  },
}
