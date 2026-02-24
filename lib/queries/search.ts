import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  content: string
  tags: string[] | null
  price_type: string
  reading_time: number
  view_count: number
  created_at: string
  users: {
    username: string
    avatar: string | null
    full_name: string | null
  }
}

export async function searchContents(query: string, page: number = 1) {
  const supabase = await createClient()
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Search in title, excerpt, and content
  // Also search in tags array
  const { data, error, count } = await supabase
    .from('contents')
    .select(`
      id,
      title,
      excerpt,
      content,
      tags,
      price_type,
      reading_time,
      view_count,
      created_at,
      users!inner (
        username,
        avatar,
        full_name
      )
    `, { count: 'exact' })
    .eq('status', 'approved')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to search contents: ${error.message}`)
  }

  // Also search by tags
  const { data: tagResults } = await supabase
    .from('contents')
    .select(`
      id,
      title,
      excerpt,
      content,
      tags,
      price_type,
      reading_time,
      view_count,
      created_at,
      users!inner (
        username,
        avatar,
        full_name
      )
    `)
    .eq('status', 'approved')
    .contains('tags', [query])
    .order('created_at', { ascending: false })
    .range(from, to)

  // Combine and deduplicate results
  const allResults = [...(data || []), ...(tagResults || [])]
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.id, item])).values()
  )

  // 处理 Supabase 嵌套查询返回的数组
  const normalizedResults = uniqueResults.map(result => {
    const users = result.users as any
    return {
      ...result,
      users: Array.isArray(users) ? users[0] : users
    }
  })

  const totalPages = Math.ceil((count || 0) / pageSize)

  return {
    contents: normalizedResults as unknown as SearchResult[],
    totalPages,
    totalResults: count || 0,
  }
}
