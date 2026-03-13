'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/middleware/admin'
import { normalizeSingleRelation } from '@/lib/utils/normalize'

/**
 * 概览统计数据
 */
export interface OverviewStats {
  totalUsers: number
  activeUsersToday: number
  activeUsersWeek: number
  activeUsersMonth: number
  totalContents: number
}

/**
 * 获取概览统计数据
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  await requireAdmin()
  const supabase = await createClient()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    { count: totalUsers },
    { data: activeToday },
    { data: activeWeek },
    { data: activeMonth },
    { count: totalContents },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase
      .from('analytics_events')
      .select('user_id')
      .gte('created_at', today.toISOString())
      .not('user_id', 'is', null),
    supabase
      .from('analytics_events')
      .select('user_id')
      .gte('created_at', weekAgo.toISOString())
      .not('user_id', 'is', null),
    supabase
      .from('analytics_events')
      .select('user_id')
      .gte('created_at', monthAgo.toISOString())
      .not('user_id', 'is', null),
    supabase.from('contents').select('*', { count: 'exact', head: true }),
  ])

  // 计算活跃用户数（去重）
  const activeUsersToday = new Set(activeToday?.map((e) => e.user_id)).size
  const activeUsersWeek = new Set(activeWeek?.map((e) => e.user_id)).size
  const activeUsersMonth = new Set(activeMonth?.map((e) => e.user_id)).size

  return {
    totalUsers: totalUsers || 0,
    activeUsersToday,
    activeUsersWeek,
    activeUsersMonth,
    totalContents: totalContents || 0,
  }
}

/**
 * 用户增长数据点
 */
export interface GrowthDataPoint {
  date: string
  users: number
  contents: number
}

/**
 * 获取用户增长数据（近 30 天）
 */
export async function getUserGrowthData(
  days: number = 30
): Promise<GrowthDataPoint[]> {
  await requireAdmin()
  const supabase = await createClient()

  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const [{ data: recentUsers }, { data: recentContents }] = await Promise.all([
    supabase
      .from('users')
      .select('created_at')
      .gte('created_at', since.toISOString()),
    supabase
      .from('contents')
      .select('created_at')
      .gte('created_at', since.toISOString()),
  ])

  // 构建日期数组
  const dataPoints: GrowthDataPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    dataPoints.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      users: 0,
      contents: 0,
    })
  }

  // 聚合数据
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  recentUsers?.forEach((u) => {
    const key = fmt(u.created_at)
    const item = dataPoints.find((d) => d.date === key)
    if (item) item.users++
  })

  recentContents?.forEach((c) => {
    const key = fmt(c.created_at)
    const item = dataPoints.find((d) => d.date === key)
    if (item) item.contents++
  })

  return dataPoints
}

/**
 * 用户留存率数据
 */
export interface RetentionData {
  cohort: string
  day1: number
  day7: number
  day30: number
}

/**
 * 获取用户留存率数据
 */
export async function getUserRetentionData(): Promise<RetentionData[]> {
  await requireAdmin()
  const supabase = await createClient()

  // 获取最近 30 天注册的用户
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: users } = await supabase
    .from('users')
    .select('id, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  if (!users || users.length === 0) {
    return []
  }

  // 按周分组
  const cohorts: { [key: string]: string[] } = {}
  users.forEach((user) => {
    const date = new Date(user.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const cohortKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = []
    }
    cohorts[cohortKey].push(user.id)
  })

  // 计算留存率
  const retentionData: RetentionData[] = []

  for (const [cohort, userIds] of Object.entries(cohorts)) {
    const cohortDate = new Date(cohort)

    // 获取这些用户在 D1, D7, D30 的活跃情况
    const day1 = new Date(cohortDate)
    day1.setDate(day1.getDate() + 1)
    const day7 = new Date(cohortDate)
    day7.setDate(day7.getDate() + 7)
    const day30 = new Date(cohortDate)
    day30.setDate(day30.getDate() + 30)

    const [{ data: activeDay1 }, { data: activeDay7 }, { data: activeDay30 }] =
      await Promise.all([
        supabase
          .from('analytics_events')
          .select('user_id')
          .in('user_id', userIds)
          .gte('created_at', day1.toISOString())
          .lt(
            'created_at',
            new Date(day1.getTime() + 24 * 60 * 60 * 1000).toISOString()
          ),
        supabase
          .from('analytics_events')
          .select('user_id')
          .in('user_id', userIds)
          .gte('created_at', day7.toISOString())
          .lt(
            'created_at',
            new Date(day7.getTime() + 24 * 60 * 60 * 1000).toISOString()
          ),
        supabase
          .from('analytics_events')
          .select('user_id')
          .in('user_id', userIds)
          .gte('created_at', day30.toISOString())
          .lt(
            'created_at',
            new Date(day30.getTime() + 24 * 60 * 60 * 1000).toISOString()
          ),
      ])

    const totalUsers = userIds.length
    const day1Retention =
      totalUsers > 0
        ? (new Set(activeDay1?.map((e) => e.user_id)).size / totalUsers) * 100
        : 0
    const day7Retention =
      totalUsers > 0
        ? (new Set(activeDay7?.map((e) => e.user_id)).size / totalUsers) * 100
        : 0
    const day30Retention =
      totalUsers > 0
        ? (new Set(activeDay30?.map((e) => e.user_id)).size / totalUsers) * 100
        : 0

    retentionData.push({
      cohort,
      day1: Math.round(day1Retention),
      day7: Math.round(day7Retention),
      day30: Math.round(day30Retention),
    })
  }

  return retentionData.slice(0, 4) // 返回最近 4 周的数据
}

/**
 * 热门内容数据
 */
export interface TopContent {
  id: string
  title: string
  author: string
  views: number
  likes: number
  comments: number
}

interface ContentAuthorRelation {
  username: string
}

/**
 * 获取热门内容 Top 10
 */
export async function getTopContents(limit: number = 10): Promise<TopContent[]> {
  await requireAdmin()
  const supabase = await createClient()

  const { data: contents } = await supabase
    .from('contents')
    .select(
      `
      id,
      title,
      view_count,
      likes_count,
      comments_count,
      author:users!contents_author_id_fkey(username)
    `
    )
    .eq('status', 'approved')
    .order('view_count', { ascending: false })
    .limit(limit)

  return (
    contents?.map((content) => ({
      id: content.id,
      title: content.title,
      author: normalizeSingleRelation(content.author as ContentAuthorRelation | ContentAuthorRelation[] | null)?.username || 'Unknown',
      views: content.view_count || 0,
      likes: content.likes_count || 0,
      comments: content.comments_count || 0,
    })) || []
  )
}
