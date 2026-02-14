'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const bio = formData.get('bio') as string
  const fullName = formData.get('full_name') as string

  // Update user profile
  const { error } = await supabase
    .from('users')
    .update({
      bio,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  // Get username for redirect
  const { data: profile } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single()

  revalidatePath(`/u/${profile?.username}`)
  revalidatePath('/settings')
  redirect(`/u/${profile?.username}`)
}

export async function getUserByUsername(username: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data
}
