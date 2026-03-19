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
import { useTranslations } from 'use-intl'

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
  const t = useTranslations('communitiesPage')
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
      toast.success(t('saveSuccess'), { description: t('saveSuccessDescription') })
      window.location.href = `/communities/${community.slug}`
    } else {
      toast.error(t('saveFailed'), { description: result.error || t('actionFailed') })
    }
  }

  async function handleDelete() {
    if (!confirm(t('deleteConfirm'))) {
      return
    }

    setIsDeleting(true)
    const result = await deleteCommunity(community.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success(t('deleteSuccess'), { description: t('deleteSuccessDescription') })
      router.push('/communities')
      router.refresh()
    } else {
      toast.error(t('deleteFailed'), { description: result.error || t('actionFailed') })
    }
  }

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t('settingsBasic')}</h2>
        <form onSubmit={handleUpdate} className="space-y-6">
          <input type="hidden" name="icon_url" value={iconUrl} readOnly />
          <input type="hidden" name="cover_url" value={coverUrl} readOnly />

          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={community.name}
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionLabel')}</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={community.description || ''}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('typeLabel')}</Label>
            <RadioGroup name="type" defaultValue={community.type}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="font-normal cursor-pointer">
                  {t('public')} - {t('publicDescription')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="font-normal cursor-pointer">
                  {t('private')} - {t('privateDescription')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t('icon')}</Label>
            <CommunityIconUpload
              currentIcon={iconUrl || null}
              onUploadSuccess={setIconUrl}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('cover')}</Label>
            <CommunityCoverUpload
              currentCover={coverUrl || null}
              onUploadSuccess={setCoverUrl}
              onRemove={() => setCoverUrl('')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </form>
      </Card>

      {/* 危险操作 */}
      <Card className="p-6 border-destructive">
        <h2 className="text-xl font-semibold mb-4 text-destructive">{t('settingsDanger')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('dangerHint')}
        </p>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? t('deleting') : t('deleteCommunity')}
        </Button>
      </Card>
    </div>
  )
}
