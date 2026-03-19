'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateUserProfile } from '@/lib/actions/user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AvatarUpload } from '@/components/user/avatar-upload'
import { useTranslations } from 'use-intl'

interface ProfileSettingsProps {
  user: {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    avatar: string | null
    github_username: string | null
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const t = useTranslations('userSettings')
  const [fullName, setFullName] = useState(user.full_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateUserProfile({
        full_name: fullName,
        bio,
        avatar,
      })

      toast.success(t('updated'))
      router.refresh()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(t('updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AvatarUpload
          currentAvatar={avatar}
          onUploadSuccess={(url) => setAvatar(url)}
        />

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('username')}
            </label>
            <Input
              value={user.username}
              disabled
              className="h-10 text-sm bg-secondary/60 border-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {t('usernameHint')}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('fullName')}
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('fullNamePlaceholder')}
              maxLength={50}
              className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('bio')}
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('bioPlaceholder')}
              maxLength={200}
              className="text-sm bg-secondary/60 border-none resize-none min-h-[80px] focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {bio.length} / 200
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="h-9 bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90 text-xs shadow-lg"
          >
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
