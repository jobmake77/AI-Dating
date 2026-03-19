'use client'

import { useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTranslations } from 'use-intl'

export function AppearanceSettings() {
  const t = useTranslations('theme')
  const [activeTheme, setActiveTheme] = useState('light')
  const themes = [
    { id: 'light', label: t('light'), icon: Sun },
    { id: 'dark', label: t('dark'), icon: Moon },
    { id: 'system', label: t('system'), icon: Monitor },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-foreground mb-3">{t('mode')}</p>
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
