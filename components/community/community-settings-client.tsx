'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCommunity, deleteCommunity } from '@/lib/actions/communities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CommunityIconUpload } from '@/components/community/community-icon-upload'
import { CommunityCoverUpload } from '@/components/community/community-cover-upload'
import { Settings, Users, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CommunitySettingsClientProps {
  community: {
    id: string
    slug: string
    name: string
    description: string | null
    type: string
    icon_url: string | null
    cover_url: string | null
  }
  slug: string
}

const settingsTabs = [
  { id: 'basic', label: '基本信息', icon: Settings, color: 'text-primary' },
  { id: 'members', label: '成员管理', icon: Users, color: 'text-info' },
  { id: 'permissions', label: '权限设置', icon: Shield, color: 'text-warning' },
  { id: 'danger', label: '危险操作', icon: Trash2, color: 'text-destructive' },
] as const

export function CommunitySettingsClient({ community, slug }: CommunitySettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('basic')
  const [name, setName] = useState(community.name)
  const [description, setDescription] = useState(community.description || '')
  const [type, setType] = useState(community.type)
  const [iconUrl, setIconUrl] = useState<string>(community.icon_url || '')
  const [coverUrl, setCoverUrl] = useState<string>(community.cover_url || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (iconUrl) formData.set('icon_url', iconUrl)
    if (coverUrl) formData.set('cover_url', coverUrl)

    const result = await updateCommunity(community.id, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('保存成功', { description: '社区信息已更新' })
      router.push(`/communities/${slug}`)
      router.refresh()
    } else {
      toast.error('保存失败', { description: result.error || '请稍后重试' })
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除这个社区吗？此操作无法撤销，所有帖子和成员关系都将被删除。')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteCommunity(community.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('删除成功', { description: '社区已删除' })
      router.push('/communities')
      router.refresh()
    } else {
      toast.error('删除失败', { description: result.error || '请稍后重试' })
    }
  }

  return (
    <div className="flex gap-5">
      {/* Left Sidebar Navigation */}
      <nav className="w-52 shrink-0 hidden md:block">
        <div className="space-y-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary' : tab.color}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0">
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-foreground mb-5">基本信息</h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">社区名称</label>
                <Input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  maxLength={50}
                  className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">社区描述</label>
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-sm bg-secondary/60 border-none resize-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">社区类型</label>
                <RadioGroup name="type" value={type} onValueChange={setType}>
                  <div className="flex items-center space-x-2 rounded-md px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="public" id="public" />
                    <label htmlFor="public" className="text-xs cursor-pointer flex-1">
                      <span className="font-medium text-foreground">公开社区</span>
                      <span className="text-muted-foreground"> - 任何人都可以查看和加入</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md px-3 py-2.5 hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value="private" id="private" />
                    <label htmlFor="private" className="text-xs cursor-pointer flex-1">
                      <span className="font-medium text-foreground">私密社区</span>
                      <span className="text-muted-foreground"> - 需要邀请才能加入</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">社区图标</label>
                <CommunityIconUpload
                  currentIcon={iconUrl || null}
                  onUploadSuccess={setIconUrl}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">社区封面</label>
                <CommunityCoverUpload
                  currentCover={coverUrl || null}
                  onUploadSuccess={setCoverUrl}
                  onRemove={() => setCoverUrl('')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '保存中...' : '保存修改'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-foreground mb-5">成员管理</h2>
            <div className="rounded-lg bg-secondary/60 p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">成员管理已开放在独立页面</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                创建者默认为版主，可在成员页把后续加入的成员设为管理员或版主
              </p>
              <Button asChild size="sm" className="mt-4 h-9 text-xs">
                <Link href={`/communities/${slug}/members`}>前往成员管理</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'permissions' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-foreground mb-5">权限设置</h2>
            <div className="rounded-lg bg-secondary/60 p-8 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">权限设置功能即将推出</p>
              <p className="text-[10px] text-muted-foreground mt-1">你可以在这里设置发帖权限、审核规则等</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'danger' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive bg-card p-6 shadow-card"
          >
            <h2 className="text-sm font-bold text-destructive mb-3">危险操作</h2>
            <p className="text-xs text-muted-foreground mb-5">
              删除社区将永久删除所有帖子、评论和成员关系。此操作无法撤销。
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-9 text-xs"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {isDeleting ? '删除中...' : '删除社区'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
