'use client'

/**
 * Keyboard Shortcuts Help Dialog
 * Displays all available keyboard shortcuts
 */

import React, { useState } from 'react'
import { KEYBOARD_SHORTCUTS } from '@/types/keyboard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsHelpProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  const categories = {
    navigation: '导航',
    actions: '操作',
    ui: '界面',
  }

  const groupedShortcuts = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, typeof KEYBOARD_SHORTCUTS>)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        aria-label="查看键盘快捷键"
      >
        <Keyboard className="h-5 w-5" />
      </Button>

      <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>键盘快捷键</DialogTitle>
            <DialogDescription>
              使用这些快捷键可以更高效地浏览和操作
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3">
                  {categories[category as keyof typeof categories]}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.action}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>提示：</strong>按 <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border rounded">?</kbd> 可随时打开此帮助面板
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
