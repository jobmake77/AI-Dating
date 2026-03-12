'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

const notificationOptions = [
  {
    id: 'likes',
    label: '有人赞了你的帖子',
    desc: '包括帖子和评论的点赞',
    color: 'bg-destructive'
  },
  {
    id: 'comments',
    label: '有人评论了你的帖子',
    desc: '包括回复你的评论',
    color: 'bg-blue-500'
  },
  {
    id: 'follows',
    label: '有人关注了你',
    desc: '新粉丝通知',
    color: 'bg-purple-500'
  },
  {
    id: 'messages',
    label: '私信通知',
    desc: '收到新的私信时通知',
    color: 'bg-primary'
  },
  {
    id: 'community',
    label: '社区动态',
    desc: '你加入的社区有新活动',
    color: 'bg-green-500'
  },
]

export function NotificationSettings() {
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

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">通知设置</h2>
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
