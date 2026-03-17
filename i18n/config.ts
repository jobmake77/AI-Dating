export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh'
export const localeCookieName = 'locale'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'zh' || value === 'en'
}

export const localeNames: Record<Locale, string> = {
  zh: '简体中文',
  en: 'English',
}

export const localeFlags: Record<Locale, string> = {
  zh: '🇨🇳',
  en: '🇺🇸',
}
