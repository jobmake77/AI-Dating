'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCommunity, deleteCommunity } from '@/lib/actions/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CommunityIconUpload } from '@/components/community/community-icon-upload'
import { CommunityCoverUpload } from '@/components/community/community-cover-upload'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CommunitySettingsFormProps {
  community: {
    id: string
    slug: string
    name: string
    description: string | null
    type: string
    icon_url: string | null
    cover_url: string | null
  }
}

export function CommunitySettingsForm({ community }: CommunitySettingsFormProps) {
  const router = useRouter()
  const [iconUrl, setIconUrl] = useState<string>(community.icon_url || '')
  const [coverUrl, setCoverUrl] = useState<string>(community.cover_url || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const result = await updateCommunity(community.id, formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success('保存成功', { description: '社区信息已更新' })
      window.location.href = `/communities/${community.slug}`
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
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">基本信息</h2>
        <form onSubmit={handleUpdate} className="space-y-6">
          <input type="hidden" name="icon_url" value={iconUrl} readOnly />
          <input type="hidden" name="cover_url" value={coverUrl} readOnly />

          <div className="space-y-2">
            <Label htmlFor="name">社区名称</Label>
            <Input
              id="name"
              name="name"
              defaultValue={community.name}
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">社区描述</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={community.description || ''}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>社区类型</Label>
            <RadioGroup name="type" defaultValue={community.type}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="font-normal cursor-pointer">
                  公开社区 - 任何人都可以查看和加入
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="font-normal cursor-pointer">
                  私密社区 - 需要邀请才能加入
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>社区图标</Label>
            <CommunityIconUpload
              currentIcon={iconUrl || null}
              onUploadSuccess={setIconUrl}
            />
          </div>

          <div className="space-y-2">
            <Label>社区封面</Label>
            <CommunityCoverUpload
              currentCover={coverUrl || null}
              onUploadSuccess={setCoverUrl}
              onRemove={() => setCoverUrl('')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存更改'}
          </Button>
        </form>
      </Card>

      {/* 危险操作 */}
      <Card className="p-6 border-destructive">
        <h2 className="text-xl font-semibold mb-4 text-destructive">危险操作</h2>
        <p className="text-sm text-muted-foreground mb-4">
          删除社区将永久删除所有帖子、评论和成员关系。此操作无法撤销。
        </p>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? '删除中...' : '删除社区'}
        </Button>
      </Card>
    </div>
  )
}
