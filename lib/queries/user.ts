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
  const { data: contentStatsData } = await supabase
    .from('contents')
    .select('likes_count, comments_count, reposts_count, view_count')
    .eq('author_id', userId)
    .eq('status', 'approved')
    .is('deleted_at', null)

  const totals = (contentStatsData || []).reduce(
    (sum, content) => ({
      likes: sum.likes + (content.likes_count || 0),
      comments: sum.comments + (content.comments_count || 0),
      reposts: sum.reposts + (content.reposts_count || 0),
      views: sum.views + (content.view_count || 0),
    }),
    { likes: 0, comments: 0, reposts: 0, views: 0 }
  )

  return {
    contents_count: contentsCount || 0,
    total_likes: totals.likes,
    total_comments: totals.comments,
    total_reposts: totals.reposts,
    total_views: totals.views,
  }
}
