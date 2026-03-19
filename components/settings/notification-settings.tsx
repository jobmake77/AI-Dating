'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'use-intl'

export function NotificationSettings() {
  const t = useTranslations('settingsNotifications')
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    community: false,
  })

  const handleToggle = (id: string) => {
    setNotifications(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }
  const notificationOptions = [
    {
      id: 'likes',
      label: t('likesLabel'),
      desc: t('likesDesc'),
      color: 'bg-destructive'
    },
    {
      id: 'comments',
      label: t('commentsLabel'),
      desc: t('commentsDesc'),
      color: 'bg-blue-500'
    },
    {
      id: 'follows',
      label: t('followsLabel'),
      desc: t('followsDesc'),
      color: 'bg-purple-500'
    },
    {
      id: 'messages',
      label: t('messagesLabel'),
      desc: t('messagesDesc'),
      color: 'bg-primary'
    },
    {
      id: 'community',
      label: t('communityLabel'),
      desc: t('communityDesc'),
      color: 'bg-green-500'
    },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>
      <div className="space-y-1">
        {notificationOptions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${item.color}`} />
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <Switch
              checked={notifications[item.id]}
              onCheckedChange={() => handleToggle(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
