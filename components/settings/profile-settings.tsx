'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateUserProfile } from '@/lib/actions/user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AvatarUpload } from '@/components/user/avatar-upload'

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

      toast.success('资料已更新')
      router.refresh()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('更新失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
      <h2 className="text-sm font-bold text-foreground">个人资料</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AvatarUpload
          currentAvatar={avatar}
          onUploadSuccess={(url) => setAvatar(url)}
        />

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              用户名
            </label>
            <Input
              value={user.username}
              disabled
              className="h-10 text-sm bg-secondary/60 border-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              用户名不可修改
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              显示名称
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="你的名字"
              maxLength={50}
              className="h-10 text-sm bg-secondary/60 border-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              简介
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下你自己..."
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
            {isSubmitting ? '保存中...' : '保存修改'}
          </Button>
        </div>
      </form>
    </div>
  )
}
