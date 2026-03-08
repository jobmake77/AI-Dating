'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'

/**
 * 踢出社区成员
 */
export async function kickMember(communityId: string, memberId: string, reason?: string) {
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
      return { success: false, error: '没有权限踢出成员' }
    }

    // 检查被踢出的成员角色
    const { data: targetMember } = await supabase
      .from('community_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('community_id', communityId)
      .single()

    if (!targetMember) {
      return { success: false, error: '成员不存在' }
    }

    // 版主不能踢出管理员
    if (currentUserMember.role === 'moderator' && targetMember.role === 'admin') {
      return { success: false, error: '版主不能踢出管理员' }
    }

    // 不能踢出自己
    if (targetMember.user_id === user.id) {
      return { success: false, error: '不能踢出自己' }
    }

    // 踢出成员
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('id', memberId)
      .eq('community_id', communityId)

    if (error) {
      logger.error('踢出成员失败:', error)
      return { success: false, error: '踢出成员失败' }
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
    logger.error('踢出成员错误:', error)
    return { success: false, error: '踢出成员失败' }
  }
}

/**
 * 禁言社区成员
 */
export async function banMember(
  communityId: string,
  userId: string,
  reason?: string,
  bannedUntil?: string // ISO 8601 格式，null 表示永久禁言
) {
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
      return { success: false, error: '没有权限禁言成员' }
    }

    // 检查被禁言的成员角色
    const { data: targetMember } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single()

    if (!targetMember) {
      return { success: false, error: '成员不存在' }
    }

    // 版主不能禁言管理员
    if (currentUserMember.role === 'moderator' && targetMember.role === 'admin') {
      return { success: false, error: '版主不能禁言管理员' }
    }

    // 不能禁言自己
    if (userId === user.id) {
      return { success: false, error: '不能禁言自己' }
    }

    // 添加禁言记录
    const { error } = await supabase
      .from('community_member_bans')
      .upsert({
        community_id: communityId,
        user_id: userId,
        banned_by: user.id,
        reason: reason || null,
        banned_until: bannedUntil || null,
      })

    if (error) {
      logger.error('禁言成员失败:', error)
      return { success: false, error: '禁言成员失败' }
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
    logger.error('禁言成员错误:', error)
    return { success: false, error: '禁言成员失败' }
  }
}

/**
 * 解除禁言
 */
export async function unbanMember(communityId: string, userId: string) {
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
      return { success: false, error: '没有权限解除禁言' }
    }

    // 解除禁言
    const { error } = await supabase
      .from('community_member_bans')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId)

    if (error) {
      logger.error('解除禁言失败:', error)
      return { success: false, error: '解除禁言失败' }
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
    logger.error('解除禁言错误:', error)
    return { success: false, error: '解除禁言失败' }
  }
}

/**
 * 获取社区成员列表（包含禁言状态）
 */
export async function getCommunityMembers(communityId: string, page: number = 1, limit: number = 20) {
  try {
    const supabase = await createClient()

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: members, error, count } = await supabase
      .from('community_members')
      .select(`
        *,
        user:user_id (
          id,
          username,
          avatar,
          full_name
        )
      `, { count: 'exact' })
      .eq('community_id', communityId)
      .order('joined_at', { ascending: false })
      .range(from, to)

    if (error) {
      logger.error('获取社区成员失败:', error)
      return { success: false, error: '获取社区成员失败' }
    }

    // 获取禁言状态
    const memberIds = members?.map(m => m.user_id) || []
    const { data: bans } = await supabase
      .from('community_member_bans')
      .select('*')
      .eq('community_id', communityId)
      .in('user_id', memberIds)

    const banMap = new Map(bans?.map(b => [b.user_id, b]) || [])

    const membersWithBanStatus = members?.map(member => ({
      ...member,
      ban: banMap.get(member.user_id) || null
    }))

    return {
      success: true,
      members: membersWithBanStatus || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  } catch (error) {
    logger.error('获取社区成员错误:', error)
    return { success: false, error: '获取社区成员失败' }
  }
}

/**
 * 获取社区统计数据
 */
export async function getCommunityStats(communityId: string) {
  try {
    const supabase = await createClient()

    // 获取社区基本信息
    const { data: community } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single()

    if (!community) {
      return { success: false, error: '社区不存在' }
    }

    // 获取最近7天的帖子数
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentPostsCount } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .gte('created_at', sevenDaysAgo.toISOString())

    // 获取最近7天的新成员数
    const { count: recentMembersCount } = await supabase
      .from('community_members')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .gte('joined_at', sevenDaysAgo.toISOString())

    // 获取活跃成员数（最近7天发过帖的成员）
    const { data: activeMembersData } = await supabase
      .from('community_posts')
      .select('author_id')
      .eq('community_id', communityId)
      .gte('created_at', sevenDaysAgo.toISOString())

    const activeMembersCount = new Set(activeMembersData?.map(p => p.author_id) || []).size

    return {
      success: true,
      stats: {
        totalMembers: community.members_count,
        totalPosts: community.posts_count,
        recentPosts: recentPostsCount || 0,
        recentMembers: recentMembersCount || 0,
        activeMembers: activeMembersCount,
        createdAt: community.created_at
      }
    }
  } catch (error) {
    logger.error('获取社区统计错误:', error)
    return { success: false, error: '获取社区统计失败' }
  }
}
