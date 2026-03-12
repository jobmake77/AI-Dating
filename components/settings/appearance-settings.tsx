'use client'

import { useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes = [
  { id: 'light', label: '浅色', icon: Sun },
  { id: 'dark', label: '深色', icon: Moon },
  { id: 'system', label: '跟随系统', icon: Monitor },
]

export function AppearanceSettings() {
  const [activeTheme, setActiveTheme] = useState('light')

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">外观设置</h2>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-foreground mb-3">主题</p>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-xs transition-all ${
                  activeTheme === theme.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                <theme.icon className="h-5 w-5" />
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
