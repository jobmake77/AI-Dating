/**
 * 统一错误处理工具
 * 提供错误分类、友好消息映射和自动重试机制
 */

import { logger } from './logger'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  type: ErrorType
  statusCode?: number
  isOperational: boolean

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    isOperational = true
  ) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * 错误消息映射 - 将技术错误转换为用户友好的消息
 */
const errorMessages: Record<string, string> = {
  // 网络错误
  'Failed to fetch': '网络连接失败，请检查您的网络连接',
  'Network request failed': '网络请求失败，请稍后重试',
  'NetworkError': '网络错误，请检查您的网络连接',

  // 认证错误
  'Invalid login credentials': '邮箱或密码错误',
  'Email not confirmed': '请先验证您的邮箱',
  'User not found': '用户不存在',
  'Invalid token': '登录已过期，请重新登录',
  'Unauthorized': '您没有权限访问此内容',

  // 验证错误
  'Invalid email': '邮箱格式不正确',
  'Password too short': '密码长度不足',
  'Username already exists': '用户名已被使用',
  'Email already exists': '该邮箱已被注册',

  // 服务器错误
  'Internal server error': '服务器出错了，请稍后重试',
  'Service unavailable': '服务暂时不可用，请稍后重试',
  'Database error': '数据库错误，请稍后重试',

  // 其他
  'Not found': '请求的内容不存在',
  'Forbidden': '您没有权限执行此操作',
  'Too many requests': '请求过于频繁，请稍后再试',
}

/**
 * 获取用户友好的错误消息
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // 检查是否有映射的友好消息
    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message.includes(key)) {
        return message
      }
    }

    // 如果是开发环境，返回原始错误消息
    if (process.env.NODE_ENV === 'development') {
      return error.message
    }
  }

  return '操作失败，请稍后重试'
}

/**
 * 分类错误类型
 */
export function classifyError(error: unknown): ErrorType {
  if (error instanceof AppError) {
    return error.type
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK
    }
    if (message.includes('unauthorized') || message.includes('credentials')) {
      return ErrorType.AUTH
    }
    if (message.includes('not found')) {
      return ErrorType.NOT_FOUND
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.PERMISSION
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION
    }
  }

  return ErrorType.UNKNOWN
}

/**
 * 重试配置
 */
interface RetryOptions {
  maxRetries?: number
  delay?: number
  backoff?: boolean
  shouldRetry?: (error: unknown) => boolean
}

/**
 * 默认重试配置
 */
const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  delay: 1000,
  backoff: true,
  shouldRetry: (error: unknown) => {
    const errorType = classifyError(error)
    // 只重试网络错误和服务器错误
    return errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER
  },
}

/**
 * 带重试的异步函数执行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options }
  let lastError: unknown

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 如果是最后一次尝试，或者不应该重试，直接抛出错误
      if (attempt === opts.maxRetries || !opts.shouldRetry(error)) {
        throw error
      }

      // 计算延迟时间（指数退避）
      const delay = opts.backoff
        ? opts.delay * Math.pow(2, attempt)
        : opts.delay

      logger.warn(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} after ${delay}ms`,
        error
      )

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Server Action 错误处理包装器
 */
export function handleServerActionError(error: unknown): { error: string } {
  logger.error('Server action error:', error)

  const friendlyMessage = getFriendlyErrorMessage(error)

  return { error: friendlyMessage }
}

/**
 * API 路由错误处理
 */
export function handleApiError(error: unknown): Response {
  logger.error('API error:', error)

  const errorType = classifyError(error)
  const friendlyMessage = getFriendlyErrorMessage(error)

  let statusCode = 500

  switch (errorType) {
    case ErrorType.AUTH:
      statusCode = 401
      break
    case ErrorType.PERMISSION:
      statusCode = 403
      break
    case ErrorType.NOT_FOUND:
      statusCode = 404
      break
    case ErrorType.VALIDATION:
      statusCode = 400
      break
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
      statusCode = 500
      break
  }

  return Response.json(
    { error: friendlyMessage },
    { status: statusCode }
  )
}
