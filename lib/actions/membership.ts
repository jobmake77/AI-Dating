'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/middleware/admin'
import { z } from 'zod'

// Validation schemas
const userIdSchema = z.string().uuid('无效的用户ID')

const membershipSchema = z.object({
  userId: z.string().uuid('无效的用户ID'),
  days: z.number().int('天数必须是整数').min(1, '天数必须大于0').max(3650, '天数不能超过10年'),
})

/**
 * 获取所有用户列表
 */
export async function getAllUsers() {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get users: ${error.message}`)
  }

  return data
}

/**
 * 标记用户为会员
 * @param userId 用户 ID
 * @param days 会员天数
 */
export async function setUserMembership(userId: string, days: number) {
  // Validate input
  const validation = membershipSchema.safeParse({ userId, days })
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  await requireAdmin()

  const supabase = await createClient()

  // 计算到期时间
  const expireAt = new Date()
  expireAt.setDate(expireAt.getDate() + days)

  // 更新用户会员状态
  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_member: true,
      member_expire_at: expireAt.toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Failed to set membership: ${updateError.message}`)
  }

  // 记录订阅历史
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_type: 'monthly', // 手动标记默认为月度
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expireAt.toISOString(),
  })

  revalidatePath('/admin/users')
  revalidatePath(`/u/${userId}`)
}

/**
 * 取消用户会员
 * @param userId 用户 ID
 */
export async function cancelUserMembership(userId: string) {
  // Validate input
  const validation = userIdSchema.safeParse(userId)
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message)
  }

  await requireAdmin()

  const supabase = await createClient()

  // 更新用户会员状态
  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_member: false,
      member_expire_at: null,
    })
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Failed to cancel membership: ${updateError.message}`)
  }

  // 更新订阅状态为已取消
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'active')

  revalidatePath('/admin/users')
  revalidatePath(`/u/${userId}`)
}

/**
 * 检查用户是否为会员
 * @param userId 用户 ID
 * @returns 是否为会员
 */
export async function checkUserMembership(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('is_member, member_expire_at')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  // 检查是否为会员且未过期
  if (!data.is_member) {
    return false
  }

  if (data.member_expire_at) {
    const expireDate = new Date(data.member_expire_at)
    const now = new Date()
    if (expireDate < now) {
      // 会员已过期，自动更新状态
      await supabase
        .from('users')
        .update({ is_member: false })
        .eq('id', userId)
      return false
    }
  }

  return true
}

/**
 * 更新用户角色
 * @param userId 用户 ID
 * @param role 角色（user/creator/admin）
 */
export async function updateUserRole(userId: string, role: 'user' | 'creator' | 'admin') {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`)
  }

  revalidatePath('/admin/users')
}
