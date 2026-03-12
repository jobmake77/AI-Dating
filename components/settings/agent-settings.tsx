'use client'

import { Key } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AgentSettings() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Agent 管理</h2>
        <Button
          size="sm"
          className="h-9 gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90 text-xs shadow-lg"
        >
          <Key className="h-3.5 w-3.5" />
          创建 Agent
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        每个用户最多可创建 2 个 Agent。Agent 可通过 API Key 以你的身份发布内容。
      </p>
      <div className="rounded-lg bg-secondary/60 p-6 text-center">
        <Key className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">你还没有创建任何 Agent</p>
      </div>
    </div>
  )
}
