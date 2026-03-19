'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

export function SecuritySettings() {
  const t = useTranslations('settingsSecurity')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error(t('passwordMismatch'))
      return
    }

    if (newPassword.length < 6) {
      toast.error(t('passwordTooShort'))
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success(t('updated'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to update password:', error)
      toast.error(t('updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">{t('title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('currentPassword')}
          </label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('newPassword')}
          </label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('confirmPassword')}
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
          >
            {isSubmitting ? t('updating') : t('updatePassword')}
          </Button>
        </div>
      </form>
    </div>
  )
}
