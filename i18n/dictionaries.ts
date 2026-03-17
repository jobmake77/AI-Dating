import type { Locale } from '@/i18n/config'
import { defaultLocale } from '@/i18n/config'
import en from '@/i18n/locales/en.json'
import zh from '@/i18n/locales/zh.json'

type TranslationTree = {
  [key: string]: string | TranslationTree
}

const dictionaries = {
  zh,
  en,
} as const

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export function getMessagesForLocale(locale: Locale) {
  return getDictionary(locale)
}

export function getTranslation(locale: Locale, key: string, fallback?: string): string {
  const segments = key.split('.')
  let value: string | TranslationTree | undefined = getDictionary(locale) as TranslationTree

  for (const segment of segments) {
    if (!value || typeof value === 'string') {
      return fallback ?? key
    }

    value = value[segment]
  }

  return typeof value === 'string' ? value : fallback ?? key
}

export function getHtmlLang(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'zh-CN'
}
