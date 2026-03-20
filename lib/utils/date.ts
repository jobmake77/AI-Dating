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
 * 历史上这里返回相对时间；现在统一返回明确日期，避免“一个月前”等模糊表达
 */
export function formatRelativeTime(date: string | Date): string {
  return formatISODate(date)
}

/**
 * 格式化为 ISO 日期字符串（YYYY-MM-DD）
 */
export function formatISODate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
