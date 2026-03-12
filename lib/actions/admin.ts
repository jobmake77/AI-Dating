'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { trackEvent } from '@/lib/analytics/events'
import { z } from 'zod'

// Validation schemas
const userIdSchema = z.string().uuid('无效的用户ID')

const updateMembershipSchema = z.object({
  userId: z.string().uuid('无效的用户ID'),
  membershipTier: z.enum(['free', 'premium'], { message: '会员等级必须是 free 或 premium' }),
  expireAt: z.string().datetime('无效的过期时间').optional(),
})

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
    .select('id, username, full_name, email, avatar, membership_tier, member_expire_at, role, created_at')
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
  // Validate input
  const validation = updateMembershipSchema.safeParse({ userId, membershipTier, expireAt })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

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

  // 追踪会员状态变更事件
  if (membershipTier === 'premium') {
    await trackEvent('membership_purchased', {
      user_id: userId,
      plan_type: 'premium',
      expire_at: expireAt,
    })
  } else {
    await trackEvent('membership_cancelled', {
      user_id: userId,
    })
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

  // 追踪角色升级事件
  if (role === 'creator') {
    await trackEvent('user_upgraded_to_creator', {
      user_id: userId,
    })
  }

  revalidatePath('/admin/members')
}
