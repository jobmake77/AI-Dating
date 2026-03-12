import { createClient } from '@/lib/supabase/server'

export interface Comment {
  id: string
  content_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
  replies?: Comment[]
}

export async function getCommentsByContentId(contentId: string): Promise<Comment[]> {
  const supabase = await createClient()

  // 先尝试带 parent_id 的查询（需要迁移 024 已执行）
  let data: any[] | null = null
  let hasParentId = true

  const { data: d1, error: e1 } = await supabase
    .from('comments')
    .select(`
      id,
      content_id,
      user_id,
      content,
      parent_id,
      created_at,
      user:users (
        id,
        username,
        avatar
      )
    `)
    .eq('content_id', contentId)
    .is('deleted_at', null)  // Exclude soft-deleted comments
    .order('created_at', { ascending: true })

  if (e1) {
    // parent_id 列不存在时降级查询
    hasParentId = false
    const { data: d2, error: e2 } = await supabase
      .from('comments')
      .select(`
        id,
        content_id,
        user_id,
        content,
        created_at,
        user:users (
          id,
          username,
          avatar
        )
      `)
      .eq('content_id', contentId)
      .is('deleted_at', null)  // Exclude soft-deleted comments
      .order('created_at', { ascending: false })

    if (e2) {
      console.error('Failed to fetch comments:', e2)
      return []
    }
    data = d2
  } else {
    data = d1
  }

  const normalized: Comment[] = (data || []).map((c: any) => ({
    ...c,
    parent_id: hasParentId ? (c.parent_id ?? null) : null,
    user: Array.isArray(c.user) ? c.user[0] : c.user,
    replies: [],
  }))

  if (!hasParentId) {
    // 没有 parent_id 列，直接返回平铺列表（倒序已在查询中处理）
    return normalized
  }

  // 组装树形结构
  const map = new Map<string, Comment>()
  normalized.forEach((c) => map.set(c.id, c))

  const roots: Comment[] = []
  normalized.forEach((c) => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(c)
    } else {
      roots.push(c)
    }
  })

  roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return roots
}
