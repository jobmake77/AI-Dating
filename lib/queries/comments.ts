import { createClient } from '@/lib/supabase/server'

export interface Comment {
  id: string
  content_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
}

export async function getCommentsByContentId(contentId: string): Promise<Comment[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch comments:', error)
    return []
  }

  return data as Comment[]
}
