'use client'

/**
 * Theme Color Picker Component
 * Allows users to choose custom theme colors
 */

import React from 'react'
import { useTheme } from './theme-provider'
import { ThemeColor, THEME_COLORS } from '@/types/theme'
import { Label } from '@/components/ui/label'

export function ThemeColorPicker() {
  const { preferences, setColor } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="theme-color">主题颜色</Label>
        <p className="text-sm text-muted-foreground mt-1">
          选择你喜欢的主题颜色
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(Object.keys(THEME_COLORS) as ThemeColor[]).map((color) => {
          const { name, primary } = THEME_COLORS[color]
          const isSelected = preferences.color === color

          return (
            <button
              key={color}
              onClick={() => setColor(color)}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-lg
                border-2 transition-all hover:scale-105
                ${isSelected ? 'border-primary' : 'border-border'}
              `}
              aria-label={`选择${name}主题`}
              aria-pressed={isSelected}
            >
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  backgroundColor: `hsl(${primary})`,
                }}
              />
              <span className="text-xs font-medium">{name}</span>
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
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
