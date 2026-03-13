'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
const updateProfileSchema = z.object({
  full_name: z.string().min(1, '姓名不能为空').max(100, '姓名过长').optional(),
  bio: z.string().max(500, '个人简介不能超过 500 字符').optional(),
  github_username: z.string().max(50, 'GitHub 用户名过长').optional(),
  avatar: z.string().url('无效的头像 URL').optional(),
})

const usernameSchema = z.string().min(1, '用户名不能为空').max(50, '用户名过长')

interface UpdateProfileData {
  full_name?: string
  bio?: string
  github_username?: string
  avatar?: string
}

export async function updateUserProfile(data: UpdateProfileData) {
  // Validate input
  const validation = updateProfileSchema.safeParse(data)
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Update user profile
  const { error } = await supabase
    .from('users')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  // Get username for revalidation
  const { data: profile } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single()

  revalidatePath(`/u/${profile?.username}`)
  revalidatePath('/settings')
}

export async function getUserByUsername(username: string) {
  // Validate input
  const validation = usernameSchema.safeParse(username)
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data
}
