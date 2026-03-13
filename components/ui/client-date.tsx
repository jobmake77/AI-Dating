'use client'

import { useHydrated } from '@/lib/hooks/use-hydrated'
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/date'

interface ClientDateProps {
  date: string | Date
  format?: 'date' | 'datetime' | 'relative'
  options?: Intl.DateTimeFormatOptions
}

/**
 * 客户端日期组件
 * 避免 SSR hydration 错误
 */
export function ClientDate({ date, format = 'date', options }: ClientDateProps) {
  const mounted = useHydrated()

  if (!mounted) {
    // 服务端渲染时返回 ISO 格式
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return <time dateTime={dateObj.toISOString()}>{dateObj.toISOString().split('T')[0]}</time>
  }

  // 客户端渲染时使用本地化格式
  const dateObj = typeof date === 'string' ? new Date(date) : date
  let formattedDate: string

  switch (format) {
    case 'datetime':
      formattedDate = formatDateTime(dateObj, options)
      break
    case 'relative':
      formattedDate = formatRelativeTime(dateObj)
      break
    case 'date':
    default:
      formattedDate = formatDate(dateObj, options)
      break
  }

  return (
    <time dateTime={dateObj.toISOString()} suppressHydrationWarning>
      {formattedDate}
    </time>
  )
}
