'use client'

import React from 'react'
import { Globe } from 'lucide-react'
import { localeNames, type Locale } from '@/i18n/config'
import { useLocaleSwitcher, useOptionalTranslation } from '@/components/i18n/locale-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface LanguageSwitcherProps {
  currentLocale?: Locale
  onLocaleChange?: (locale: Locale) => void
}

export function LanguageSwitcher({ currentLocale = 'zh', onLocaleChange }: LanguageSwitcherProps) {
  const { locale: activeLocale, setLocale } = useLocaleSwitcher()
  const t = useOptionalTranslation()
  const selectedLocale = currentLocale ?? activeLocale

  const handleLocaleChange = async (locale: Locale) => {
    await setLocale(locale)
    onLocaleChange?.(locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('common.languageSwitcher', '切换语言 / Switch language')}
          className="h-8 gap-1.5 px-2 text-xs"
        >
          <Globe className="h-5 w-5" />
          <span className="font-medium uppercase">{selectedLocale}</span>
          <span className="sr-only">{t('common.languageSwitcher', '切换语言 / Switch language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {(['zh', 'en'] as const).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => void handleLocaleChange(locale)}
            className="flex items-center gap-2"
          >
            <span>{localeNames[locale]}</span>
            {selectedLocale === locale && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
