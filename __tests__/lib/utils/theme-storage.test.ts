/**
 * Theme Storage Utility Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadThemePreferences,
  saveThemePreferences,
  clearThemePreferences,
  applyThemePreferences,
} from '@/lib/utils/theme-storage'
import { DEFAULT_THEME_PREFERENCES } from '@/types/theme'

describe('Theme Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document classes
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme-color')
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    document.documentElement.style.fontSize = ''
  })

  describe('loadThemePreferences', () => {
    it('should return default preferences when localStorage is empty', () => {
      const preferences = loadThemePreferences()
      expect(preferences).toEqual(DEFAULT_THEME_PREFERENCES)
    })

    it('should load preferences from localStorage', () => {
      const testPreferences = {
        ...DEFAULT_THEME_PREFERENCES,
        mode: 'dark' as const,
        color: 'blue' as const,
      }
      localStorage.setItem('theme-preferences', JSON.stringify(testPreferences))

      const preferences = loadThemePreferences()
      expect(preferences.mode).toBe('dark')
      expect(preferences.color).toBe('blue')
    })

    it('should merge with defaults for partial data', () => {
      localStorage.setItem('theme-preferences', JSON.stringify({ mode: 'dark' }))

      const preferences = loadThemePreferences()
      expect(preferences.mode).toBe('dark')
      expect(preferences.color).toBe(DEFAULT_THEME_PREFERENCES.color)
      expect(preferences.fontSize).toBe(DEFAULT_THEME_PREFERENCES.fontSize)
    })

    it('should return defaults on parse error', () => {
      localStorage.setItem('theme-preferences', 'invalid json')

      const preferences = loadThemePreferences()
      expect(preferences).toEqual(DEFAULT_THEME_PREFERENCES)
    })
  })

  describe('saveThemePreferences', () => {
    it('should save preferences to localStorage', () => {
      const testPreferences = {
        ...DEFAULT_THEME_PREFERENCES,
        mode: 'dark' as const,
      }

      saveThemePreferences(testPreferences)

      const stored = localStorage.getItem('theme-preferences')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.mode).toBe('dark')
    })
  })

  describe('clearThemePreferences', () => {
    it('should remove preferences from localStorage', () => {
      localStorage.setItem('theme-preferences', JSON.stringify(DEFAULT_THEME_PREFERENCES))

      clearThemePreferences()

      expect(localStorage.getItem('theme-preferences')).toBeNull()
    })
  })

  describe('applyThemePreferences', () => {
    it('should apply light mode', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        mode: 'light',
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('should apply dark mode', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        mode: 'dark',
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should apply high contrast mode', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        highContrast: true,
      })

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
    })

    it('should apply theme color', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        color: 'blue',
      })

      expect(document.documentElement.getAttribute('data-theme-color')).toBe('blue')
    })

    it('should apply font size', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        fontSize: 'large',
      })

      expect(document.documentElement.style.fontSize).toBe('18px')
    })

    it('should apply small font size', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        fontSize: 'small',
      })

      expect(document.documentElement.style.fontSize).toBe('14px')
    })

    it('should apply medium font size', () => {
      applyThemePreferences({
        ...DEFAULT_THEME_PREFERENCES,
        fontSize: 'medium',
      })

      expect(document.documentElement.style.fontSize).toBe('16px')
    })
  })
})
