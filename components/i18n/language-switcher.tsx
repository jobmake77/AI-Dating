'use client'

/**
 * Language Switcher Component
 * Allows users to switch between languages
 */

import React from 'react'
import { Globe } from 'lucide-react'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'
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
  const handleLocaleChange = (locale: Locale) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)
    }

    // Call callback
    onLocaleChange?.(locale)

    // Reload page to apply new locale
    // In a real implementation with next-intl, this would use router.push
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="切换语言 / Switch language"
          className="relative"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">切换语言 / Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
            {currentLocale === locale && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
