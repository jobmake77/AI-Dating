'use client'

/**
 * High Contrast Mode Toggle Component
 * Enables/disables high contrast mode for better accessibility
 */

import React from 'react'
import { useTheme } from './theme-provider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function HighContrastToggle() {
  const { preferences, setHighContrast } = useTheme()

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex-1 space-y-1">
        <Label htmlFor="high-contrast">高对比度模式</Label>
        <p className="text-sm text-muted-foreground">
          增强颜色对比度，提高可读性（WCAG AAA 标准）
        </p>
      </div>
      <Switch
        id="high-contrast"
        checked={preferences.highContrast}
        onCheckedChange={setHighContrast}
        aria-label="切换高对比度模式"
      />
    </div>
  )
}
