'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { EventCoverUpload } from './event-cover-upload'
import { createEvent } from '@/lib/actions/events'
import { toast } from 'sonner'

interface EventCreateFormProps {
  isAdmin?: boolean
}

export function EventCreateForm({ isAdmin = false }: EventCreateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverUrl, setCoverUrl] = useState('')
  const [eventType, setEventType] = useState<'offline' | 'official'>('offline')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (coverUrl) formData.set('cover_url', coverUrl)
    if (isAdmin) formData.set('type', eventType)

    const result = await createEvent(formData)
    setIsSubmitting(false)

    if (!result.success) {
      toast.error('创建失败', { description: result.error })
      return
    }

    toast.success('活动创建成功')
    router.push(`/events/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 管理员：活动类型选择 */}
      {isAdmin && (
        <div className="space-y-2">
          <Label>活动类型</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEventType('offline')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                eventType === 'offline'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              线下活动
            </button>
            <button
              type="button"
              onClick={() => setEventType('official')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                eventType === 'official'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-accent'
              }`}
            >
              官方活动
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">活动标题 *</Label>
        <Input
          id="title"
          name="title"
          placeholder="给活动起个吸引人的名字"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">活动地点 *</Label>
        <Input
          id="location"
          name="location"
          placeholder="填写详细地址或线上链接"
          required
          minLength={2}
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">开始时间 *</Label>
          <Input id="start_time" name="start_time" type="datetime-local" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">结束时间（可选）</Label>
          <Input id="end_time" name="end_time" type="datetime-local" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">活动介绍</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="介绍一下活动内容、注意事项等..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>封面图</Label>
        <EventCoverUpload
          onUploadSuccess={(url) => setCoverUrl(url)}
          onRemove={() => setCoverUrl('')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? '创建中...' : '发起活动'}
        </Button>
      </div>
    </form>
  )
}
