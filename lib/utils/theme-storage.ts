/**
 * Theme Preferences Storage Utility
 * Handles localStorage and database synchronization
 */

import { ThemePreferences, DEFAULT_THEME_PREFERENCES } from '@/types/theme'

const STORAGE_KEY = 'theme-preferences'

/**
 * Load theme preferences from localStorage
 */
export function loadThemePreferences(): ThemePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_PREFERENCES
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_THEME_PREFERENCES, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load theme preferences:', error)
  }

  return DEFAULT_THEME_PREFERENCES
}

/**
 * Save theme preferences to localStorage
 */
export function saveThemePreferences(preferences: ThemePreferences): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.error('Failed to save theme preferences:', error)
  }
}

/**
 * Clear theme preferences from localStorage
 */
export function clearThemePreferences(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear theme preferences:', error)
  }
}

/**
 * Apply theme preferences to document
 */
export function applyThemePreferences(preferences: ThemePreferences): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Apply theme mode
  if (preferences.mode === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    root.classList.toggle('dark', systemTheme === 'dark')
  } else {
    root.classList.toggle('dark', preferences.mode === 'dark')
  }

  // Apply high contrast
  root.classList.toggle('high-contrast', preferences.highContrast)

  // Apply font size
  const fontSizeScale = preferences.fontSize === 'small' ? 0.875 : preferences.fontSize === 'large' ? 1.125 : 1
  root.style.fontSize = `${fontSizeScale * 16}px`

  // Apply theme color
  root.setAttribute('data-theme-color', preferences.color)
}
