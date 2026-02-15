import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateUserProfile } from '@/lib/actions/user'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 第一层验证：检查认证状态
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log('Settings page: User not authenticated, redirecting to login')
    redirect('/login')
  }

  // 第二层验证：检查用户记录是否存在
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Settings page: Failed to fetch user profile:', profileError)
    redirect('/login')
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">个人设置</h1>
        <p className="text-muted-foreground mt-2">
          管理你的个人资料和偏好设置
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateUserProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                name="username"
                value={profile.username}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                用户名不可修改
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">昵称</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile.full_name || ''}
                placeholder="输入你的昵称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio || ''}
                placeholder="介绍一下你自己..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                邮箱由 GitHub 账号提供
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit">保存更改</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
