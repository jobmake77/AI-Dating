'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 检查是否为管理员
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

// 获取所有用户（管理员功能）
export async function getAllUsers() {
  const supabase = await createClient()

  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, email, avatar, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return data
}
// 更新用户角色
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
) {
  const supabase = await createClient()

  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('users')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`)
  }

  revalidatePath('/admin/users')
}
