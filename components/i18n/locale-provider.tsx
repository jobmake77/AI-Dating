'use client'

import React, { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale as useIntlLocale, useTranslations } from 'use-intl'
import { updateUserLocale } from '@/lib/actions/preferences'
import { localeCookieName, type Locale } from '@/i18n/config'
import { getHtmlLang } from '@/i18n/dictionaries'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => Promise<void>
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

interface LocaleProviderProps {
  children: React.ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const router = useRouter()
  const nextIntlLocale = useIntlLocale() as Locale
  const [locale, setLocaleState] = useState<Locale>(nextIntlLocale)

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(locale)
  }, [locale])

  useEffect(() => {
    setLocaleState(nextIntlLocale)
  }, [nextIntlLocale])

  const setLocale = useCallback(async (nextLocale: Locale) => {
    if (nextLocale === locale) return

    setLocaleState(nextLocale)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(localeCookieName, nextLocale)
      document.documentElement.lang = getHtmlLang(nextLocale)
    }

    try {
      const result = await updateUserLocale(nextLocale)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update locale')
      }
    } catch (error) {
      console.error('Failed to persist locale preference:', error)
    } finally {
      startTransition(() => {
        router.refresh()
      })
    }
  }, [locale, router])

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
  }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocaleSwitcher() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocaleSwitcher must be used within a LocaleProvider')
  }
  return context
}

export function useOptionalTranslation(namespace?: Parameters<typeof useTranslations>[0]) {
  const translator = useTranslations(namespace)

  return useCallback((key: string, fallback?: string, values?: Record<string, string | number>) => {
    try {
      return translator(key as never, values as never)
    } catch {
      return fallback ?? key
    }
  }, [translator])
}
