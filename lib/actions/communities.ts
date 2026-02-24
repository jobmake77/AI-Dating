'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { customAlphabet } from 'nanoid'

// 创建只包含小写字母和数字的 nanoid
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)

// =====================================================
// Helper Functions
// =====================================================

/**
 * 生成 URL 友好的 slug
 * @param name 社区名称
 * @returns slug 字符串
 */
function generateSlug(name: string): string {
  // 移除特殊字符，转换为小写，替换空格为连字符
  let slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-')      // 空格转连字符
    .replace(/--+/g, '-')      // 多个连字符转单个
    .trim()

  // 如果 slug 为空或只包含非英文字符，使用随机字符串
  if (!slug || slug.length < 2) {
    slug = `community-${nanoid(8)}`
  }

  // 添加随机后缀以确保唯一性
  slug = `${slug}-${nanoid(6)}`

  return slug
}

// =====================================================
// Validation Schemas
// =====================================================

const createCommunitySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  type: z.enum(['public', 'private']),
  icon_url: z.string().optional(),
  cover_url: z.string().optional(),
})

const updateCommunitySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().optional(),
  type: z.enum(['public', 'private']).optional(),
  icon_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
})

// =====================================================
// Community CRUD Operations
// =====================================================

export async function createCommunity(formData: FormData) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证表单数据
    const rawSlug = formData.get('slug')
    const rawDescription = formData.get('description')
    const rawIconUrl = formData.get('icon_url')
    const rawCoverUrl = formData.get('cover_url')

    const data = {
      name: formData.get('name') as string,
      slug: (typeof rawSlug === 'string' && rawSlug.trim()) || undefined,
      description: (typeof rawDescription === 'string' && rawDescription.trim()) || undefined,
      type: formData.get('type') as 'public' | 'private',
      icon_url: (typeof rawIconUrl === 'string' && rawIconUrl.trim()) || undefined,
      cover_url: (typeof rawCoverUrl === 'string' && rawCoverUrl.trim()) || undefined,
    }

    console.log('准备验证的数据:', data)

    const validatedData = createCommunitySchema.parse(data)

    console.log('验证通过的数据:', validatedData)

    // 如果没有提供 slug，自动生成
    const slug = validatedData.slug || generateSlug(validatedData.name)

    console.log('生成的 slug:', slug)

    // 检查 slug 是否已存在
    const { data: existingCommunity } = await supabase
      .from('communities')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCommunity) {
      return { success: false, error: '社区标识已存在，请使用其他标识' }
    }

    // 创建社区
    const insertData = {
      ...validatedData,
      slug,
      creator_id: user.id,
    }

    console.log('准备插入的数据:', insertData)

    const { data: community, error } = await supabase
      .from('communities')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('创建社区失败 - 完整错误:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { success: false, error: `创建社区失败: ${error.message}` }
    }

    console.log('创建的社区数据:', community)
    console.log('社区 slug:', community.slug)

    revalidatePath('/communities')
    return { success: true, data: community }
  } catch (error) {
    console.error('创建社区错误:', error)
    if (error instanceof z.ZodError) {
      console.error('Zod 验证错误详情:', error.issues)
      return { success: false, error: `表单数据验证失败: ${error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` }
    }
    return { success: false, error: '创建社区失败' }
  }
}

export async function updateCommunity(communityId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证用户权限（必须是管理员）
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'admin') {
      return { success: false, error: '没有权限修改社区信息' }
    }

    // 验证表单数据
    const data: any = {}
    if (formData.get('name')) data.name = formData.get('name')
    if (formData.get('description')) data.description = formData.get('description')
    if (formData.get('type')) data.type = formData.get('type')
    if (formData.get('icon_url')) data.icon_url = formData.get('icon_url')
    if (formData.get('cover_url')) data.cover_url = formData.get('cover_url')

    const validatedData = updateCommunitySchema.parse(data)

    // 更新社区
    const { data: community, error } = await supabase
      .from('communities')
      .update(validatedData)
      .eq('id', communityId)
      .select()
      .single()

    if (error) {
      console.error('更新社区失败:', error)
      return { success: false, error: '更新社区失败' }
    }

    revalidatePath(`/communities/${community.slug}`)
    revalidatePath('/communities')
    return { success: true, data: community }
  } catch (error) {
    console.error('更新社区错误:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: '表单数据验证失败' }
    }
    return { success: false, error: '更新社区失败' }
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证用户权限（必须是管理员）
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'admin') {
      return { success: false, error: '没有权限删除社区' }
    }

    // 删除社区
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', communityId)

    if (error) {
      console.error('删除社区失败:', error)
      return { success: false, error: '删除社区失败' }
    }

    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    console.error('删除社区错误:', error)
    return { success: false, error: '删除社区失败' }
  }
}

// =====================================================
// Community Membership Operations
// =====================================================

export async function joinCommunity(communityId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查社区是否存在
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, type, slug')
      .eq('id', communityId)
      .single()

    if (communityError || !community) {
      return { success: false, error: '社区不存在' }
    }

    // 检查是否已经是成员
    const { data: existingMember } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { success: false, error: '已经是社区成员' }
    }

    // 如果是私密社区，检查是否有邀请
    if (community.type === 'private') {
      const { data: invitation } = await supabase
        .from('community_invitations')
        .select('id, status')
        .eq('community_id', communityId)
        .eq('invitee_id', user.id)
        .single()

      if (!invitation || invitation.status !== 'accepted') {
        return { success: false, error: '需要邀请才能加入私密社区' }
      }
    }

    // 加入社区
    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member',
      })

    if (error) {
      console.error('加入社区失败:', error)
      return { success: false, error: '加入社区失败' }
    }

    revalidatePath(`/communities/${community.slug}`)
    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    console.error('加入社区错误:', error)
    return { success: false, error: '加入社区失败' }
  }
}

export async function leaveCommunity(communityId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查是否是管理员
    const { data: member } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return { success: false, error: '不是社区成员' }
    }

    // 如果是管理员，检查是否还有其他管理员
    if (member.role === 'admin') {
      const { data: admins } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('role', 'admin')

      if (admins && admins.length === 1) {
        return { success: false, error: '至少需要一个管理员，请先转让管理员权限' }
      }
    }

    // 退出社区
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id)

    if (error) {
      console.error('退出社区失败:', error)
      return { success: false, error: '退出社区失败' }
    }

    // 获取社区 slug 用于重定向
    const { data: community } = await supabase
      .from('communities')
      .select('slug')
      .eq('id', communityId)
      .single()

    if (community) {
      revalidatePath(`/communities/${community.slug}`)
    }
    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    console.error('退出社区错误:', error)
    return { success: false, error: '退出社区失败' }
  }
}

export async function updateMemberRole(
  communityId: string,
  memberId: string,
  newRole: 'admin' | 'moderator' | 'member'
) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证用户权限（必须是管理员）
    const { data: currentUserMember } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return { success: false, error: '没有权限修改成员角色' }
    }

    // 更新成员角色
    const { error } = await supabase
      .from('community_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('community_id', communityId)

    if (error) {
      console.error('更新成员角色失败:', error)
      return { success: false, error: '更新成员角色失败' }
    }

    // 获取社区 slug
    const { data: community } = await supabase
      .from('communities')
      .select('slug')
      .eq('id', communityId)
      .single()

    if (community) {
      revalidatePath(`/communities/${community.slug}/members`)
    }
    return { success: true }
  } catch (error) {
    console.error('更新成员角色错误:', error)
    return { success: false, error: '更新成员角色失败' }
  }
}

export async function removeMember(communityId: string, memberId: string) {
  try {
    const supabase = await createClient()

    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证用户权限（必须是管理员或版主）
    const { data: currentUserMember } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single()

    if (!currentUserMember || !['admin', 'moderator'].includes(currentUserMember.role)) {
      return { success: false, error: '没有权限移除成员' }
    }

    // 检查被移除的成员角色
    const { data: targetMember } = await supabase
      .from('community_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('community_id', communityId)
      .single()

    if (!targetMember) {
      return { success: false, error: '成员不存在' }
    }

    // 版主不能移除管理员
    if (currentUserMember.role === 'moderator' && targetMember.role === 'admin') {
      return { success: false, error: '版主不能移除管理员' }
    }

    // 不能移除自己
    if (targetMember.user_id === user.id) {
      return { success: false, error: '不能移除自己，请使用退出社区功能' }
    }

    // 移除成员
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('id', memberId)
      .eq('community_id', communityId)

    if (error) {
      console.error('移除成员失败:', error)
      return { success: false, error: '移除成员失败' }
    }

    // 获取社区 slug
    const { data: community } = await supabase
      .from('communities')
      .select('slug')
      .eq('id', communityId)
      .single()

    if (community) {
      revalidatePath(`/communities/${community.slug}/members`)
    }
    return { success: true }
  } catch (error) {
    console.error('移除成员错误:', error)
    return { success: false, error: '移除成员失败' }
  }
}

