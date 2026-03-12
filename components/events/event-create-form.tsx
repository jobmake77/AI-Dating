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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 管理员：活动类型选择 */}
      {isAdmin && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">活动类型</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEventType('offline')}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                eventType === 'offline'
                  ? 'gradient-primary text-white border-transparent shadow-primary'
                  : 'border-border hover:bg-accent text-foreground'
              }`}
            >
              线下活动
            </button>
            <button
              type="button"
              onClick={() => setEventType('official')}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                eventType === 'official'
                  ? 'gradient-primary text-white border-transparent shadow-primary'
                  : 'border-border hover:bg-accent text-foreground'
              }`}
            >
              官方活动
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs font-medium">活动标题 *</Label>
        <Input
          id="title"
          name="title"
          placeholder="给活动起个吸引人的名字"
          required
          minLength={2}
          maxLength={100}
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-xs font-medium">活动地点 *</Label>
        <Input
          id="location"
          name="location"
          placeholder="填写详细地址或线上链接"
          required
          minLength={2}
          maxLength={200}
          className="h-9 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start_time" className="text-xs font-medium">开始时间 *</Label>
          <Input id="start_time" name="start_time" type="datetime-local" required className="h-9 text-xs" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time" className="text-xs font-medium">结束时间（可选）</Label>
          <Input id="end_time" name="end_time" type="datetime-local" className="h-9 text-xs" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-medium">活动介绍</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="介绍一下活动内容、注意事项等..."
          rows={4}
          className="text-xs resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">封面图</Label>
        <EventCoverUpload
          onUploadSuccess={(url) => setCoverUrl(url)}
          onRemove={() => setCoverUrl('')}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1 h-9 text-xs gradient-primary text-white hover:opacity-90 shadow-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? '创建中...' : '发起活动'}
        </Button>
      </div>
    </form>
  )
}
