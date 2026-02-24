'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCommunity } from '@/lib/actions/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CommunityIconUpload } from '@/components/community/community-icon-upload'
import { CommunityCoverUpload } from '@/components/community/community-cover-upload'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateCommunityPage() {
  const router = useRouter()
  const [iconUrl, setIconUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (iconUrl) formData.set('icon_url', iconUrl)
    if (coverUrl) formData.set('cover_url', coverUrl)

    const result = await createCommunity(formData)
    setIsSubmitting(false)

    if (result.success && result.data) {
      toast.success('创建成功', { description: '社区已创建' })
      router.push(`/communities/${result.data.slug}`)
    } else {
      toast.error('创建失败', { description: result.error || '请稍后重试' })
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link href="/communities">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回社区列表
        </Button>
      </Link>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">创建社区</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">社区名称 *</Label>
            <Input
              id="name"
              name="name"
              placeholder="例如：前端开发者"
              required
              minLength={2}
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              2-50 个字符
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">社区描述</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="介绍一下这个社区..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>社区类型 *</Label>
            <RadioGroup name="type" defaultValue="public" required>
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

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '创建社区'}
            </Button>
            <Link href="/communities" className="flex-1">
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                取消
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
