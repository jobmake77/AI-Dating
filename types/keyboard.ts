/**
 * Keyboard Shortcuts Types
 */

export type KeyboardShortcutAction =
  | 'search'
  | 'create'
  | 'home'
  | 'profile'
  | 'settings'
  | 'help'
  | 'theme-toggle'
  | 'notifications'
  | 'messages'
  | 'escape'

export interface KeyboardShortcut {
  key: string
  action: KeyboardShortcutAction
  description: string
  category: 'navigation' | 'actions' | 'ui'
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'g h', action: 'home', description: '返回首页', category: 'navigation' },
  { key: 'g p', action: 'profile', description: '个人主页', category: 'navigation' },
  { key: 'g s', action: 'settings', description: '设置', category: 'navigation' },
  { key: 'g n', action: 'notifications', description: '通知', category: 'navigation' },
  { key: 'g m', action: 'messages', description: '消息', category: 'navigation' },

  // Actions
  { key: '/', action: 'search', description: '搜索', category: 'actions' },
  { key: 'c', action: 'create', description: '创建内容', category: 'actions' },

  // UI
  { key: 't', action: 'theme-toggle', description: '切换主题', category: 'ui' },
  { key: '?', action: 'help', description: '快捷键帮助', category: 'ui' },
  { key: 'Escape', action: 'escape', description: '关闭弹窗', category: 'ui' },
]
