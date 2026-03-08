/**
 * 错误日志记录工具
 * 开发环境：记录到 console
 * 生产环境：准备 Sentry 集成（可选）
 */

import { logger } from './logger'
import { classifyError, ErrorType } from './error-handler'

/**
 * 错误上下文信息
 */
interface ErrorContext {
  userId?: string
  userEmail?: string
  url?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

/**
 * 记录错误
 */
export function logError(
  error: unknown,
  context?: ErrorContext
): void {
  const errorType = classifyError(error)
  const timestamp = new Date().toISOString()

  // 构建错误信息
  const errorInfo = {
    timestamp,
    type: errorType,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  }

  // 开发环境：详细日志
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error occurred:', errorInfo)
    return
  }

  // 生产环境：记录到 console（可以被日志收集工具捕获）
  console.error('[ERROR]', JSON.stringify(errorInfo))

  // TODO: 生产环境可以集成 Sentry
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     contexts: {
  //       custom: context,
  //     },
  //     tags: {
  //       errorType,
  //     },
  //   })
  // }
}

/**
 * 记录客户端错误
 */
export function logClientError(
  error: unknown,
  context?: ErrorContext
): void {
  logError(error, {
    ...context,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  })
}

/**
 * 记录服务端错误
 */
export function logServerError(
  error: unknown,
  context?: ErrorContext
): void {
  logError(error, context)
}
