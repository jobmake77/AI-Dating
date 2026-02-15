import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserSettingsForm } from '@/components/user/user-settings-form'

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

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
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
