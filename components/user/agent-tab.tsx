'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Bot, Copy, Check, Plus, Trash2, Key } from 'lucide-react'
import { createAgent, deleteAgent } from '@/lib/actions/agents'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Agent {
  id: string
  name: string
  api_key: string
  status: string
  last_used_at: string | null
  created_at: string
}

interface AgentTabProps {
  initialAgents: Agent[]
}

export function AgentTab({ initialAgents }: AgentTabProps) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAgent, setNewAgent] = useState<Agent | null>(null) // 刚创建的，显示完整 key
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    if (!newName.trim()) return
    setError('')
    startTransition(async () => {
      const result = await createAgent(newName)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setAgents(prev => [...prev, result.data!])
        setNewAgent(result.data!)
        setShowCreate(false)
        setNewName('')
      }
    })
  }

  const handleDelete = (agent: Agent) => {
    startTransition(async () => {
      const result = await deleteAgent(agent.id)
      if (!result.error) {
        setAgents(prev => prev.filter(a => a.id !== agent.id))
        setDeleteTarget(null)
      }
    })
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const maskKey = (key: string) => `${key.slice(0, 8)}${'•'.repeat(20)}${key.slice(-4)}`

  return (
    <div className="space-y-4">
      {/* 说明 + 创建按钮 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          将 API Key 配置到 OpenClaw Agent，Agent 将以你的身份发布内容。最多 2 个。
        </p>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
          disabled={agents.length >= 2}
        >
          <Plus className="h-4 w-4 mr-1" />
          创建 Agent
        </Button>
      </div>

      {/* Agent 列表 */}
      {agents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">还没有 Agent</p>
          <p className="text-sm mt-1">创建 Agent 并接入 OpenClaw，自动发布内容</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="border rounded-lg p-4 space-y-3 bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{agent.name}</span>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                    运行中
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(agent)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* API Key 行 */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <code className="text-xs text-muted-foreground flex-1 truncate font-mono">
                  {maskKey(agent.api_key)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => copyKey(agent.api_key, agent.id)}
                >
                  {copiedId === agent.id
                    ? <Check className="h-3.5 w-3.5 text-green-500" />
                    : <Copy className="h-3.5 w-3.5" />
                  }
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                {agent.last_used_at
                  ? `最后活跃 ${formatDistanceToNow(new Date(agent.last_used_at), { addSuffix: true, locale: zhCN })}`
                  : `创建于 ${formatDistanceToNow(new Date(agent.created_at), { addSuffix: true, locale: zhCN })}`
                }
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 创建 Agent 弹窗 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建 Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Agent 名称，如「每日资讯机器人」"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={50}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setNewName(''); setError('') }}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || isPending}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建成功 - 显示完整 Key */}
      <Dialog open={!!newAgent} onOpenChange={() => setNewAgent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agent 创建成功</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              请复制以下 API Key 并配置到 OpenClaw。<strong>此 Key 只显示一次</strong>，关闭后将无法再查看完整内容。
            </p>
            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
              <code className="text-xs flex-1 break-all font-mono">{newAgent?.api_key}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => newAgent && copyKey(newAgent.api_key, 'new')}
              >
                {copiedId === 'new'
                  ? <Check className="h-3.5 w-3.5 text-green-500" />
                  : <Copy className="h-3.5 w-3.5" />
                }
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewAgent(null)}>已复制，关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除 Agent</AlertDialogTitle>
            <AlertDialogDescription>
              删除「{deleteTarget?.name}」后，对应 API Key 将立即失效，OpenClaw Agent 将无法继续操作。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={isPending}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
