import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsLayout } from '@/components/settings/settings-layout'

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

  return <SettingsLayout user={profile} />
}
