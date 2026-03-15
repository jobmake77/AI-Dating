'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { customAlphabet } from 'nanoid'
import { logger } from '@/lib/utils/logger'

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

type CommunityManagerRole = 'admin' | 'moderator' | 'member'

function canManageCommunitySettings(args: {
  isCreator: boolean
  role?: CommunityManagerRole
}) {
  return args.isCreator || args.role === 'admin'
}

function canManageCommunityRoles(args: {
  isCreator: boolean
  role?: CommunityManagerRole
}) {
  return args.isCreator || args.role === 'admin' || args.role === 'moderator'
}

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

    logger.debug('准备验证的数据:', data)

    const validatedData = createCommunitySchema.parse(data)

    logger.debug('验证通过的数据:', validatedData)

    // 如果没有提供 slug，自动生成
    const slug = validatedData.slug || generateSlug(validatedData.name)

    logger.debug('生成的 slug:', slug)

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

    logger.debug('准备插入的数据:', insertData)

    const { data: community, error } = await supabase
      .from('communities')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      logger.error('创建社区失败 - 完整错误:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { success: false, error: `创建社区失败: ${error.message}` }
    }

    logger.debug('创建的社区数据:', community)
    logger.debug('社区 slug:', community.slug)

    // 触发器会自动创建创建者成员关系，这里再显式调整为版主，确保行为与产品规则一致
    const { error: roleSyncError } = await supabase
      .from('community_members')
      .update({ role: 'moderator' })
      .eq('community_id', community.id)
      .eq('user_id', user.id)

    if (roleSyncError) {
      logger.error('同步创建者社区角色失败:', roleSyncError)
      return { success: false, error: '创建社区成功，但初始化管理角色失败' }
    }

    revalidatePath('/communities')
    return { success: true, data: community }
  } catch (error) {
    logger.error('创建社区错误:', error)
    if (error instanceof z.ZodError) {
      logger.error('Zod 验证错误详情:', error.issues)
      return { success: false, error: `表单数据验证失败: ${error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ')}` }
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
    const [{ data: community }, { data: member }] = await Promise.all([
      supabase
        .from('communities')
        .select('id, creator_id')
        .eq('id', communityId)
        .single(),
      supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single(),
    ])

    if (!community) {
      return { success: false, error: '社区不存在' }
    }

    const isCreator = community.creator_id === user.id
    if (!member || !canManageCommunitySettings({ isCreator, role: member.role as CommunityManagerRole })) {
      return { success: false, error: '没有权限修改社区信息' }
    }

    // 验证表单数据
    const data: Record<string, FormDataEntryValue> = {}
    const name = formData.get('name')
    const description = formData.get('description')
    const type = formData.get('type')
    const iconUrl = formData.get('icon_url')
    const coverUrl = formData.get('cover_url')

    if (name) data.name = name
    if (description) data.description = description
    if (type) data.type = type
    if (iconUrl) data.icon_url = iconUrl
    if (coverUrl) data.cover_url = coverUrl

    const validatedData = updateCommunitySchema.parse(data)

    // 更新社区
    const { data: updatedCommunity, error } = await supabase
      .from('communities')
      .update(validatedData)
      .eq('id', communityId)
      .select()
      .single()

    if (error) {
      logger.error('更新社区失败:', error)
      return { success: false, error: '更新社区失败' }
    }

    revalidatePath(`/communities/${updatedCommunity.slug}`)
    revalidatePath('/communities')
    return { success: true, data: updatedCommunity }
  } catch (error) {
    logger.error('更新社区错误:', error)
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
    const [{ data: community }, { data: member }] = await Promise.all([
      supabase
        .from('communities')
        .select('id, creator_id')
        .eq('id', communityId)
        .single(),
      supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single(),
    ])

    if (!community) {
      return { success: false, error: '社区不存在' }
    }

    const isCreator = community.creator_id === user.id
    if (!member || !canManageCommunitySettings({ isCreator, role: member.role as CommunityManagerRole })) {
      return { success: false, error: '没有权限删除社区' }
    }

    // 删除社区
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', communityId)

    if (error) {
      logger.error('删除社区失败:', error)
      return { success: false, error: '删除社区失败' }
    }

    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    logger.error('删除社区错误:', error)
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
      logger.error('加入社区失败:', error)
      return { success: false, error: '加入社区失败' }
    }

    revalidatePath(`/communities/${community.slug}`)
    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    logger.error('加入社区错误:', error)
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

    const [{ data: community }, { data: member }] = await Promise.all([
      supabase
        .from('communities')
        .select('id, creator_id, slug')
        .eq('id', communityId)
        .single(),
      supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single(),
    ])

    if (!community) {
      return { success: false, error: '社区不存在' }
    }

    if (!member) {
      return { success: false, error: '不是社区成员' }
    }

    if (community.creator_id === user.id) {
      return { success: false, error: '社区创建者不能退出社区' }
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
      logger.error('退出社区失败:', error)
      return { success: false, error: '退出社区失败' }
    }

    revalidatePath(`/communities/${community.slug}`)
    revalidatePath('/communities')
    return { success: true }
  } catch (error) {
    logger.error('退出社区错误:', error)
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

    const [{ data: community }, { data: currentUserMember }] = await Promise.all([
      supabase
        .from('communities')
        .select('id, slug, creator_id')
        .eq('id', communityId)
        .single(),
      supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single(),
    ])

    if (!community) {
      return { success: false, error: '社区不存在' }
    }

    const isCreator = community.creator_id === user.id
    const currentRole = currentUserMember?.role as CommunityManagerRole | undefined

    if (!currentUserMember || !canManageCommunityRoles({ isCreator, role: currentRole })) {
      return { success: false, error: '没有权限修改成员角色' }
    }

    const { data: targetMember } = await supabase
      .from('community_members')
      .select('id, role, user_id')
      .eq('id', memberId)
      .eq('community_id', communityId)
      .single()

    if (!targetMember) {
      return { success: false, error: '成员不存在' }
    }

    const targetRole = targetMember.role as CommunityManagerRole
    const isTargetCreator = targetMember.user_id === community.creator_id

    if (isTargetCreator && !isCreator) {
      return { success: false, error: '不能修改创建者角色' }
    }

    if (!isCreator && currentRole === 'moderator' && targetRole === 'admin') {
      return { success: false, error: '版主不能修改管理员角色' }
    }

    // 更新成员角色
    const { error } = await supabase
      .from('community_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('community_id', communityId)

    if (error) {
      logger.error('更新成员角色失败:', error)
      return { success: false, error: '更新成员角色失败' }
    }

    // 获取社区 slug
    revalidatePath(`/communities/${community.slug}`)
    revalidatePath(`/communities/${community.slug}/members`)
    revalidatePath(`/communities/${community.slug}/settings`)
    return { success: true }
  } catch (error) {
    logger.error('更新成员角色错误:', error)
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

    const [{ data: community }, { data: currentUserMember }] = await Promise.all([
      supabase
        .from('communities')
        .select('id, slug, creator_id')
        .eq('id', communityId)
        .single(),
      supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single(),
    ])

    if (!community) {
      return { success: false, error: '社区不存在' }
    }

    const isCreator = community.creator_id === user.id
    const currentRole = currentUserMember?.role as CommunityManagerRole | undefined

    if (!currentUserMember || !canManageCommunityRoles({ isCreator, role: currentRole })) {
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

    // 非创建者的版主不能移除管理员
    if (!isCreator && currentRole === 'moderator' && targetMember.role === 'admin') {
      return { success: false, error: '版主不能移除管理员' }
    }

    if (targetMember.user_id === community.creator_id) {
      return { success: false, error: '不能移除社区创建者' }
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
      logger.error('移除成员失败:', error)
      return { success: false, error: '移除成员失败' }
    }

    // 获取社区 slug
    revalidatePath(`/communities/${community.slug}`)
    revalidatePath(`/communities/${community.slug}/members`)
    return { success: true }
  } catch (error) {
    logger.error('移除成员错误:', error)
    return { success: false, error: '移除成员失败' }
  }
}
