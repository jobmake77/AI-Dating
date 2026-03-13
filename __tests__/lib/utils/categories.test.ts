import { describe, expect, it } from 'vitest'

import { getCategoryAliases, matchesCategoryValue } from '@/lib/utils/categories'

describe('category utilities', () => {
  it('returns canonical aliases for community categories', () => {
    expect(getCategoryAliases('suggest')).toEqual(
      expect.arrayContaining(['suggest', '产品建议'])
    )
    expect(getCategoryAliases('chat')).toEqual(
      expect.arrayContaining(['chat', '互动交流'])
    )
  })

  it('matches both slug and display name values', () => {
    expect(matchesCategoryValue('announce', 'announce')).toBe(true)
    expect(matchesCategoryValue('announce', '官方公告')).toBe(true)
    expect(matchesCategoryValue('showcase', '案例与作品')).toBe(true)
    expect(matchesCategoryValue('showcase', '技巧分享')).toBe(false)
  })
})
