'use client'

/**
 * Theme Toggle Button Component
 * Allows users to switch between light, dark, and system themes
 */

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './theme-provider'
import { ThemeMode } from '@/types/theme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { preferences, setMode } = useTheme()

  const icons = {
    light: <Sun className="h-5 w-5" />,
    dark: <Moon className="h-5 w-5" />,
    system: <Monitor className="h-5 w-5" />,
  }

  const labels = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="切换主题"
          className="relative"
        >
          {icons[preferences.mode]}
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => setMode(mode)}
            className="flex items-center gap-2"
          >
            {icons[mode]}
            <span>{labels[mode]}</span>
            {preferences.mode === mode && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
