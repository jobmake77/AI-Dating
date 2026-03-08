import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatISODate,
} from '@/lib/utils/date'

describe('Date Utils', () => {
  beforeEach(() => {
    // 固定当前时间用于测试
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-08T12:00:00Z'))
  })

  describe('formatDate', () => {
    it('应该正确格式化日期字符串', () => {
      const date = '2026-03-08T10:30:00Z'
      const result = formatDate(date)
      expect(result).toMatch(/2026/)
      expect(result).toMatch(/03/)
      expect(result).toMatch(/08/)
    })

    it('应该正确格式化 Date 对象', () => {
      const date = new Date('2026-03-08T10:30:00Z')
      const result = formatDate(date)
      expect(result).toMatch(/2026/)
    })

    it('应该支持自定义格式选项', () => {
      const date = '2026-03-08T10:30:00Z'
      const result = formatDate(date, { month: 'long' })
      expect(result).toBeTruthy()
    })
  })

  describe('formatDateTime', () => {
    it('应该正确格式化日期时间', () => {
      const date = '2026-03-08T10:30:00Z'
      const result = formatDateTime(date)
      expect(result).toMatch(/2026/)
      expect(result).toMatch(/03/)
      expect(result).toMatch(/08/)
    })
  })

  describe('formatRelativeTime', () => {
    it('应该返回"刚刚"对于少于 60 秒的时间', () => {
      const date = new Date('2026-03-08T11:59:30Z')
      const result = formatRelativeTime(date)
      expect(result).toBe('刚刚')
    })

    it('应该返回分钟数对于少于 1 小时的时间', () => {
      const date = new Date('2026-03-08T11:30:00Z')
      const result = formatRelativeTime(date)
      expect(result).toBe('30 分钟前')
    })

    it('应该返回小时数对于少于 24 小时的时间', () => {
      const date = new Date('2026-03-08T08:00:00Z')
      const result = formatRelativeTime(date)
      expect(result).toBe('4 小时前')
    })

    it('应该返回天数对于少于 30 天的时间', () => {
      const date = new Date('2026-03-05T12:00:00Z')
      const result = formatRelativeTime(date)
      expect(result).toBe('3 天前')
    })
  })

  describe('formatISODate', () => {
    it('应该返回 ISO 格式的日期字符串', () => {
      const date = '2026-03-08T10:30:00Z'
      const result = formatISODate(date)
      expect(result).toBe('2026-03-08')
    })

    it('应该处理 Date 对象', () => {
      const date = new Date('2026-03-08T10:30:00Z')
      const result = formatISODate(date)
      expect(result).toBe('2026-03-08')
    })
  })
})
