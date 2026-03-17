import { describe, expect, it } from 'vitest'
import { getDictionary, getHtmlLang, getTranslation } from '@/i18n/dictionaries'

describe('i18n dictionaries', () => {
  it('returns the expected dictionary for a locale', () => {
    expect(getDictionary('zh').nav.home).toBe('首页')
    expect(getDictionary('en').nav.home).toBe('Home')
  })

  it('resolves nested translation keys with fallback support', () => {
    expect(getTranslation('zh', 'nav.communities')).toBe('社区')
    expect(getTranslation('en', 'nav.communities')).toBe('Communities')
    expect(getTranslation('en', 'missing.key', 'Fallback')).toBe('Fallback')
  })

  it('maps locales to html lang values', () => {
    expect(getHtmlLang('zh')).toBe('zh-CN')
    expect(getHtmlLang('en')).toBe('en-US')
  })
})
