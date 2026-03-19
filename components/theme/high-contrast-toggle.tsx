'use client'

/**
 * High Contrast Mode Toggle Component
 * Enables/disables high contrast mode for better accessibility
 */

import React from 'react'
import { useTheme } from './theme-provider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'use-intl'

export function HighContrastToggle() {
  const t = useTranslations('theme')
  const { preferences, setHighContrast } = useTheme()

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex-1 space-y-1">
        <Label htmlFor="high-contrast">{t('highContrast')}</Label>
        <p className="text-sm text-muted-foreground">
          {t('highContrastDescription')}
        </p>
      </div>
      <Switch
        id="high-contrast"
        checked={preferences.highContrast}
        onCheckedChange={setHighContrast}
        aria-label={t('toggleHighContrast')}
      />
    </div>
  )
}
