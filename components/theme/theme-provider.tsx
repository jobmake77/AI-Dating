'use client'

/**
 * Theme Provider Component
 * Manages theme state and provides theme context
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  ThemePreferences,
  ThemeContextValue,
  ThemeMode,
  ThemeColor,
  FontSize,
  DEFAULT_THEME_PREFERENCES,
} from '@/types/theme'
import {
  loadThemePreferences,
  saveThemePreferences,
  applyThemePreferences,
} from '@/lib/utils/theme-storage'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultPreferences?: Partial<ThemePreferences>
}

export function ThemeProvider({ children, defaultPreferences }: ThemeProviderProps) {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const loaded = loadThemePreferences()
    return { ...loaded, ...defaultPreferences }
  })

  // Apply theme preferences on mount and when they change
  useEffect(() => {
    applyThemePreferences(preferences)
    saveThemePreferences(preferences)
  }, [preferences])

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyThemePreferences(preferences)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preferences])

  const setMode = useCallback((mode: ThemeMode) => {
    setPreferences((prev) => ({ ...prev, mode }))
  }, [])

  const setColor = useCallback((color: ThemeColor) => {
    setPreferences((prev) => ({ ...prev, color }))
  }, [])

  const setFontSize = useCallback((fontSize: FontSize) => {
    setPreferences((prev) => ({ ...prev, fontSize }))
  }, [])

  const setHighContrast = useCallback((highContrast: boolean) => {
    setPreferences((prev) => ({ ...prev, highContrast }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_THEME_PREFERENCES)
  }, [])

  const value: ThemeContextValue = {
    preferences,
    setMode,
    setColor,
    setFontSize,
    setHighContrast,
    resetToDefaults,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
