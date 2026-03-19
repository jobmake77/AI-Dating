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
import { useTranslations } from 'use-intl'

interface EventCreateFormProps {
  isAdmin?: boolean
}

export function EventCreateForm({ isAdmin = false }: EventCreateFormProps) {
  const t = useTranslations('eventCreate')
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
      toast.error(t('createFailed'), { description: result.error })
      return
    }

    toast.success(t('createSuccess'))
    router.push(`/events/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 管理员：活动类型选择 */}
      {isAdmin && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">{t('typeLabel')}</Label>
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
              {t('typeOffline')}
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
              {t('typeOfficial')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs font-medium">{t('titleLabel')}</Label>
        <Input
          id="title"
          name="title"
          placeholder={t('titlePlaceholder')}
          required
          minLength={2}
          maxLength={100}
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-xs font-medium">{t('locationLabel')}</Label>
        <Input
          id="location"
          name="location"
          placeholder={t('locationPlaceholder')}
          required
          minLength={2}
          maxLength={200}
          className="h-9 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start_time" className="text-xs font-medium">{t('startLabel')}</Label>
          <Input id="start_time" name="start_time" type="datetime-local" required className="h-9 text-xs" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time" className="text-xs font-medium">{t('endLabel')}</Label>
          <Input id="end_time" name="end_time" type="datetime-local" className="h-9 text-xs" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-medium">{t('descriptionLabel')}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          className="text-xs resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">{t('coverLabel')}</Label>
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
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1 h-9 text-xs gradient-primary text-white hover:opacity-90 shadow-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('creating') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
