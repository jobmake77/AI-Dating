'use client'

/**
 * Keyboard Shortcuts Provider
 * Manages global keyboard shortcuts
 * Note: This is a placeholder implementation.
 * Install react-hotkeys-hook for full functionality.
 */

import React, { useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { KeyboardShortcutAction } from '@/types/keyboard'

interface KeyboardShortcutsContextValue {
  registerShortcut: (key: string, callback: () => void) => void
  unregisterShortcut: (key: string) => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | undefined>(undefined)

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
  onShortcut?: (action: KeyboardShortcutAction) => void
}

export function KeyboardShortcutsProvider({ children, onShortcut }: KeyboardShortcutsProviderProps) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow '/' for search even in input fields
        if (event.key !== '/') {
          return
        }
      }

      // Handle shortcuts
      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey

      // Single key shortcuts
      if (!ctrl && !shift) {
        switch (key) {
          case '/':
            event.preventDefault()
            onShortcut?.('search')
            // Focus search input
            document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
            break
          case 'c':
            event.preventDefault()
            onShortcut?.('create')
            router.push('/create')
            break
          case 't':
            event.preventDefault()
            onShortcut?.('theme-toggle')
            // Theme toggle will be handled by ThemeProvider
            break
          case '?':
            event.preventDefault()
            onShortcut?.('help')
            break
          case 'escape':
            event.preventDefault()
            onShortcut?.('escape')
            break
        }
      }

      // 'g' prefix shortcuts (navigation)
      if (key === 'g' && !ctrl && !shift) {
        const handleNextKey = (e: KeyboardEvent) => {
          const nextKey = e.key.toLowerCase()
          switch (nextKey) {
            case 'h':
              e.preventDefault()
              onShortcut?.('home')
              router.push('/')
              break
            case 'p':
              e.preventDefault()
              onShortcut?.('profile')
              // Navigate to profile (requires user context)
              break
            case 's':
              e.preventDefault()
              onShortcut?.('settings')
              router.push('/settings')
              break
            case 'n':
              e.preventDefault()
              onShortcut?.('notifications')
              // Open notifications
              break
            case 'm':
              e.preventDefault()
              onShortcut?.('messages')
              router.push('/messages')
              break
          }
          window.removeEventListener('keydown', handleNextKey)
        }

        window.addEventListener('keydown', handleNextKey, { once: true })
        setTimeout(() => {
          window.removeEventListener('keydown', handleNextKey)
        }, 1000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, onShortcut])

  const registerShortcut = () => {
    // Placeholder for custom shortcut registration
  }

  const unregisterShortcut = () => {
    // Placeholder for custom shortcut unregistration
  }

  const value: KeyboardShortcutsContextValue = {
    registerShortcut,
    unregisterShortcut,
  }

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider')
  }
  return context
}
