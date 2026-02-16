'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUserProfile } from '@/lib/actions/user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AvatarUpload } from './avatar-upload'

interface UserSettingsFormProps {
  user: {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    avatar: string | null
    github_username: string | null
  }
}

export function UserSettingsForm({ user }: UserSettingsFormProps) {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [githubUsername, setGithubUsername] = useState(user.github_username || '')
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
        github_username: githubUsername,
        avatar,
      })

      toast.success('资料已更新')
      router.push(`/u/${user.username}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('更新失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>头像</Label>
            <AvatarUpload
              currentAvatar={avatar}
              onUploadSuccess={(url) => setAvatar(url)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={user.username}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              用户名不可修改
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">显示名称</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="你的名字"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下你自己..."
              maxLength={200}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              {bio.length} / 200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUsername">GitHub 用户名</Label>
            <Input
              id="githubUsername"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="octocat"
              maxLength={39}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存更改'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/u/${user.username}`)}
            >
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
