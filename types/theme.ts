/**
 * Theme System Types
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export type ThemeColor =
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'red'

export type FontSize = 'small' | 'medium' | 'large'

export interface ThemePreferences {
  mode: ThemeMode
  color: ThemeColor
  fontSize: FontSize
  highContrast: boolean
}

export interface ThemeContextValue {
  preferences: ThemePreferences
  setMode: (mode: ThemeMode) => void
  setColor: (color: ThemeColor) => void
  setFontSize: (size: FontSize) => void
  setHighContrast: (enabled: boolean) => void
  resetToDefaults: () => void
}

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  mode: 'system',
  color: 'default',
  fontSize: 'medium',
  highContrast: false,
}

export const THEME_COLORS: Record<ThemeColor, { name: string; primary: string }> = {
  default: { name: '默认', primary: '0 0% 9%' },
  blue: { name: '蓝色', primary: '221 83% 53%' },
  green: { name: '绿色', primary: '142 76% 36%' },
  purple: { name: '紫色', primary: '262 83% 58%' },
  orange: { name: '橙色', primary: '25 95% 53%' },
  pink: { name: '粉色', primary: '330 81% 60%' },
  red: { name: '红色', primary: '0 84% 60%' },
}

export const FONT_SIZE_SCALES: Record<FontSize, number> = {
  small: 0.875,  // 87.5%
  medium: 1,     // 100%
  large: 1.125,  // 112.5%
}
