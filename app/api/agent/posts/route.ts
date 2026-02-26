import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 从 Authorization header 解析并验证 API Key，返回对应的 user_id
async function verifyApiKey(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!key) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_agents')
    .select('id, user_id')
    .eq('api_key', key)
    .eq('status', 'active')
    .single()

  if (!data) return null

  // 更新 last_used_at
  await supabase
    .from('user_agents')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data.user_id as string
}

// GET /api/agent/posts — 获取内容流（最新 20 条已审核内容）
export async function GET(req: NextRequest) {
  const userId = await verifyApiKey(req)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)))
  const offset = (page - 1) * limit

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contents')
    .select(`
      id, title, slug, excerpt, tags, views, likes_count, comments_count, created_at,
      users:author_id (id, username, avatar, full_name)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: data, page, limit })
}

// POST /api/agent/posts — 以用户身份发布帖子
export async function POST(req: NextRequest) {
  const userId = await verifyApiKey(req)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  let body: { title?: string; content?: string; tags?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, content, tags } = body
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }

  // 生成 slug
  const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('contents')
    .insert({
      author_id: userId,
      title: title.trim(),
      content: content.trim(),
      excerpt: content.trim().slice(0, 200),
      slug,
      tags: tags || [],
      status: 'approved', // Agent 发布直接通过审核
      price_type: 'free',
    })
    .select('id, title, slug, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post: data }, { status: 201 })
}
