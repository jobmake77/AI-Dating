/**
 * Redis 缓存工具
 * 使用 Upstash Redis 提供高性能缓存
 */

import { Redis } from '@upstash/redis'

// 初始化 Redis 客户端
let redis: Redis | null = null

function getRedisClient(): Redis | null {
  if (typeof window !== 'undefined') {
    // 客户端不使用 Redis
    return null
  }

  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      console.warn('Redis credentials not configured. Caching disabled.')
      return null
    }

    redis = new Redis({
      url,
      token,
    })
  }

  return redis
}

/**
 * 缓存配置
 */
export const CACHE_TTL = {
  // 静态内容（1 小时）
  STATIC: 60 * 60,
  // 用户数据（5 分钟）
  USER: 60 * 5,
  // 热门内容（10 分钟）
  TRENDING: 60 * 10,
  // 动态内容（1 分钟）
  DYNAMIC: 60,
  // 搜索结果（5 分钟）
  SEARCH: 60 * 5,
  // 推荐内容（15 分钟）
  RECOMMENDATIONS: 60 * 15,
} as const

/**
 * 缓存键前缀
 */
export const CACHE_PREFIX = {
  CONTENT: 'content',
  USER: 'user',
  TRENDING: 'trending',
  SEARCH: 'search',
  RECOMMENDATIONS: 'recommendations',
  QUERY: 'query',
  API: 'api',
} as const

/**
 * 构建缓存键
 */
export function buildCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`
}

/**
 * 获取缓存数据
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const data = await client.get<T>(key)
    return data
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

/**
 * 设置缓存数据
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = CACHE_TTL.DYNAMIC
): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    await client.setex(key, ttl, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Redis set error:', error)
    return false
  }
}

/**
 * 删除缓存数据
 */
export async function deleteCached(key: string): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    await client.del(key)
    return true
  } catch (error) {
    console.error('Redis delete error:', error)
    return false
  }
}

/**
 * 批量删除缓存（通过模式匹配）
 */
export async function deleteCachedByPattern(pattern: string): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0

  try {
    const keys = await client.keys(pattern)
    if (keys.length === 0) return 0

    await client.del(...keys)
    return keys.length
  } catch (error) {
    console.error('Redis delete by pattern error:', error)
    return 0
  }
}

/**
 * 缓存装饰器函数
 * 自动处理缓存的获取和设置
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.DYNAMIC
): Promise<T> {
  // 尝试从缓存获取
  const cached = await getCached<T>(key)
  if (cached !== null) {
    return cached
  }

  // 缓存未命中，执行获取函数
  const data = await fetcher()

  // 存入缓存
  await setCached(key, data, ttl)

  return data
}

/**
 * 缓存失效策略
 */
export const cacheInvalidation = {
  /**
   * 内容相关缓存失效
   */
  async invalidateContent(contentId: string) {
    await Promise.all([
      deleteCached(buildCacheKey(CACHE_PREFIX.CONTENT, contentId)),
      deleteCachedByPattern(`${CACHE_PREFIX.TRENDING}:*`),
      deleteCachedByPattern(`${CACHE_PREFIX.RECOMMENDATIONS}:*`),
    ])
  },

  /**
   * 用户相关缓存失效
   */
  async invalidateUser(userId: string) {
    await Promise.all([
      deleteCached(buildCacheKey(CACHE_PREFIX.USER, userId)),
      deleteCachedByPattern(`${CACHE_PREFIX.USER}:${userId}:*`),
    ])
  },

  /**
   * 搜索缓存失效
   */
  async invalidateSearch() {
    await deleteCachedByPattern(`${CACHE_PREFIX.SEARCH}:*`)
  },

  /**
   * 全局缓存清理
   */
  async invalidateAll() {
    const client = getRedisClient()
    if (!client) return

    try {
      await client.flushdb()
    } catch (error) {
      console.error('Redis flush error:', error)
    }
  },
}

/**
 * 缓存统计
 */
export async function getCacheStats() {
  const client = getRedisClient()
  if (!client) return null

  try {
    const info = await client.info()
    return {
      connected: true,
      info,
    }
  } catch (error) {
    console.error('Redis info error:', error)
    return {
      connected: false,
      error: String(error),
    }
  }
}
