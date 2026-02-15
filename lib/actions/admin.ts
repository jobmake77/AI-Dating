'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    .select('id, username, full_name, email, membership_tier, member_expire_at, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return data
}

// 更新用户会员状态
export async function updateUserMembership(
  userId: string,
  membershipTier: 'free' | 'premium',
  expireAt?: string
) {
  const supabase = await createClient()

  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }

  const updateData: any = {
    membership_tier: membershipTier,
    updated_at: new Date().toISOString(),
  }

  if (membershipTier === 'premium' && expireAt) {
    updateData.member_expire_at = expireAt
  } else if (membershipTier === 'free') {
    updateData.member_expire_at = null
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update membership: ${error.message}`)
  }

  revalidatePath('/admin/members')
}

// 更新用户角色
export async function updateUserRole(
  userId: string,
  role: 'user' | 'creator' | 'admin'
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

  revalidatePath('/admin/members')
}
