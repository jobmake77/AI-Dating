/**
 * 数据库查询优化配置
 */

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  TRENDING_LIMIT: 5,
  COMMENTS_LIMIT: 20,
  NOTIFICATIONS_LIMIT: 20,
} as const

// 缓存配置
export const CACHE = {
  // 静态内容缓存时间（秒）
  STATIC_CONTENT: 60 * 60, // 1 小时
  // 动态内容缓存时间（秒）
  DYNAMIC_CONTENT: 60, // 1 分钟
  // 用户数据缓存时间（秒）
  USER_DATA: 60 * 5, // 5 分钟
  // 热门内容缓存时间（秒）
  TRENDING: 60 * 10, // 10 分钟
} as const

// 查询优化配置
export const QUERY_OPTIMIZATION = {
  // 使用索引的字段
  INDEXED_FIELDS: [
    'id',
    'author_id',
    'content_id',
    'user_id',
    'created_at',
    'updated_at',
    'status',
  ],

  // 需要预加载的关联数据
  PRELOAD_RELATIONS: {
    content: ['users', 'tags'],
    comment: ['users'],
    notification: ['users', 'contents'],
  },

  // 批量查询大小
  BATCH_SIZE: 100,
} as const

// 数据库连接池配置
export const DB_POOL = {
  MIN: 2,
  MAX: 10,
  IDLE_TIMEOUT: 30000, // 30 秒
  CONNECTION_TIMEOUT: 2000, // 2 秒
} as const

/**
 * 查询优化辅助函数
 */

// 构建分页查询
export function buildPaginationQuery(page: number, limit: number = PAGINATION.DEFAULT_PAGE_SIZE) {
  const safeLimit = Math.min(limit, PAGINATION.MAX_PAGE_SIZE)
  const from = (page - 1) * safeLimit
  const to = from + safeLimit - 1

  return { from, to, limit: safeLimit }
}

// 构建排序查询
export function buildOrderQuery(
  orderBy: string = 'created_at',
  ascending: boolean = false
) {
  return { column: orderBy, ascending }
}

// 构建缓存键
export function buildCacheKey(prefix: string, ...params: (string | number)[]) {
  return `${prefix}:${params.join(':')}`
}

// 获取缓存配置
export function getCacheConfig(type: keyof typeof CACHE) {
  return {
    revalidate: CACHE[type],
    tags: [type],
  }
}
