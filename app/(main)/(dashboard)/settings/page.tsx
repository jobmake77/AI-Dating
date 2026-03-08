import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserSettingsForm } from '@/components/user/user-settings-form'
import { ProgressCheckpoint } from '@/components/onboarding/progress-checkpoint'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // 检查用户是否完善了资料
  const hasCompletedProfile = !!(profile.full_name && profile.bio)

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {/* 完善资料检查点 */}
      <ProgressCheckpoint step="completed_profile" condition={hasCompletedProfile} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground mt-2">
          管理你的个人资料和账户设置
        </p>
      </div>

      <UserSettingsForm user={profile} />
    </div>
  )
}
