'use client'

import { Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'use-intl'

export function AgentSettings() {
  const t = useTranslations('settingsAgents')
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90 text-xs shadow-lg"
        >
          <Key className="h-3.5 w-3.5" />
          {t('create')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('description')}
      </p>
      <div className="rounded-lg bg-secondary/60 p-6 text-center">
        <Key className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">{t('empty')}</p>
      </div>
    </div>
  )
}
