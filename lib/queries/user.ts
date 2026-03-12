import { createClient } from '@/lib/supabase/server'

export async function getUserStats(userId: string) {
  const supabase = await createClient()

  // Get contents count
  const { count: contentsCount } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('status', 'approved')
    .is('deleted_at', null)

  // Get total likes on user's contents
  const { data: likesData } = await supabase
    .from('contents')
    .select('likes_count')
    .eq('author_id', userId)
    .eq('status', 'approved')
    .is('deleted_at', null)

  const totalLikes = likesData?.reduce((sum, content) => sum + (content.likes_count || 0), 0) || 0

  return {
    contents_count: contentsCount || 0,
    total_likes: totalLikes,
  }
}
