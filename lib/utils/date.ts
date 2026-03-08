/**
 * 日期格式化工具
 * 避免 SSR hydration 错误
 */

/**
 * 格式化日期为本地字符串
 * 使用 suppressHydrationWarning 避免 hydration 错误
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }

  return dateObj.toLocaleDateString('zh-CN', defaultOptions)
}

/**
 * 格式化日期时间为本地字符串
 */
export function formatDateTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }

  return dateObj.toLocaleString('zh-CN', defaultOptions)
}

/**
 * 格式化相对时间（如：3 天前）
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) {
    return '刚刚'
  } else if (diffMin < 60) {
    return `${diffMin} 分钟前`
  } else if (diffHour < 24) {
    return `${diffHour} 小时前`
  } else if (diffDay < 30) {
    return `${diffDay} 天前`
  } else if (diffMonth < 12) {
    return `${diffMonth} 个月前`
  } else {
    return `${diffYear} 年前`
  }
}

/**
 * 格式化为 ISO 日期字符串（YYYY-MM-DD）
 */
export function formatISODate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}
