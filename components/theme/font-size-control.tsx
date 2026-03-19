'use client'

/**
 * Font Size Control Component
 * Allows users to adjust font size (small/medium/large)
 */

import React from 'react'
import { useTheme } from './theme-provider'
import { FontSize, FONT_SIZE_SCALES } from '@/types/theme'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'use-intl'

export function FontSizeControl() {
  const t = useTranslations('theme')
  const { preferences, setFontSize } = useTheme()

  const sizes: { value: FontSize; label: string; description: string }[] = [
    { value: 'small', label: t('fontSizeSmall'), description: '87.5%' },
    { value: 'medium', label: t('fontSizeMedium'), description: '100%' },
    { value: 'large', label: t('fontSizeLarge'), description: '112.5%' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="font-size">{t('fontSize')}</Label>
        <p className="text-sm text-muted-foreground mt-1">
          {t('fontSizeDescription')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {sizes.map(({ value, label, description }) => {
          const isSelected = preferences.fontSize === value
          const scale = FONT_SIZE_SCALES[value]

          return (
            <button
              key={value}
              onClick={() => setFontSize(value)}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-lg
                border-2 transition-all hover:scale-105
                ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              aria-label={t('setFontSize', { label })}
              aria-pressed={isSelected}
            >
              <span
                className="font-semibold"
                style={{ fontSize: `${scale}rem` }}
              >
                A
              </span>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-primary-foreground">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
