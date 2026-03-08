/**
 * API 缓存中间件
 * 自动缓存 API 响应
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCached, setCached, buildCacheKey, CACHE_PREFIX, CACHE_TTL } from './redis'

export interface CacheOptions {
  ttl?: number
  prefix?: string
  keyGenerator?: (req: NextRequest) => string
  shouldCache?: (req: NextRequest, res: NextResponse) => boolean
}

/**
 * API 响应缓存中间件
 */
export function withApiCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const {
      ttl = CACHE_TTL.DYNAMIC,
      prefix = CACHE_PREFIX.API,
      keyGenerator = defaultKeyGenerator,
      shouldCache = defaultShouldCache,
    } = options

    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return handler(req)
    }

    // 生成缓存键
    const cacheKey = buildCacheKey(prefix, keyGenerator(req))

    // 尝试从缓存获取
    const cached = await getCached<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttl}`,
        },
      })
    }

    // 执行处理函数
    const response = await handler(req)

    // 检查是否应该缓存
    if (shouldCache(req, response) && response.ok) {
      const data = await response.clone().json()
      await setCached(cacheKey, data, ttl)
    }

    // 添加缓存头
    response.headers.set('X-Cache', 'MISS')
    response.headers.set('Cache-Control', `public, max-age=${ttl}`)

    return response
  }
}

/**
 * 默认缓存键生成器
 */
function defaultKeyGenerator(req: NextRequest): string {
  const url = new URL(req.url)
  return `${url.pathname}${url.search}`
}

/**
 * 默认缓存判断函数
 */
function defaultShouldCache(req: NextRequest, res: NextResponse): boolean {
  // 只缓存成功的响应
  return res.status === 200
}

/**
 * 查询参数缓存键生成器
 */
export function queryParamKeyGenerator(req: NextRequest): string {
  const url = new URL(req.url)
  const params = new URLSearchParams(url.search)
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return `${url.pathname}?${sortedParams}`
}

/**
 * 用户特定缓存键生成器
 */
export function userSpecificKeyGenerator(userId: string) {
  return (req: NextRequest): string => {
    const url = new URL(req.url)
    return `${userId}:${url.pathname}${url.search}`
  }
}
