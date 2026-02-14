import { createClient } from '@/lib/supabase/server'

export interface ContentListParams {
  page?: number
  limit?: number
  category?: string
  status?: 'approved' | 'pending' | 'rejected'
  authorId?: string
}

export async function getContents(params: ContentListParams = {}) {
  const supabase = await createClient()
  const { page = 1, limit = 12, category, status = 'approved', authorId } = params

  let query = supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar_url,
        full_name
      )
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (authorId) {
    query = query.eq('author_id', authorId)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(`Failed to fetch contents: ${error.message}`)
  }

  return {
    contents: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getContentById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar_url,
        full_name,
        bio
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
  }

  return data
}

export async function getContentBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      users:author_id (
        id,
        username,
        avatar_url,
        full_name,
        bio
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`)
  }

  return data
}
