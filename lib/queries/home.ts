import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export interface HomepageCommunityItem {
  id: string
  name: string
  slug: string
  icon_url: string | null
  members_count: number
  posts_count: number
}

export interface HomepageTagItem {
  name: string
  slug: string
  count: number
}

export interface HomepageData {
  stats: {
    totalUsers: number
    totalContents: number
    totalCommunities: number
  }
  userCommunities: HomepageCommunityItem[]
  trendingCommunities: HomepageCommunityItem[]
  popularTags: HomepageTagItem[]
}

interface JoinedCommunityRecord {
  community: HomepageCommunityItem | HomepageCommunityItem[] | null
}

function isHomepageCommunityItem(
  community: HomepageCommunityItem | null
): community is HomepageCommunityItem {
  return community !== null
}

export async function getHomepageData(userId?: string): Promise<HomepageData> {
  const supabase = await createClient()

  const [
    { count: totalUsers, error: usersError },
    { count: totalContents, error: contentsError },
    { count: totalCommunities, error: communitiesError },
    { data: joinedCommunities, error: joinedError },
    { data: trendingCommunities, error: trendingError },
    { data: popularTags, error: tagsError },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('contents')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('deleted_at', null),
    supabase
      .from('communities')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'public'),
    userId
      ? supabase
          .from('community_members')
          .select(`
            community:communities!community_members_community_id_fkey(
              id,
              name,
              slug,
              icon_url,
              members_count,
              posts_count
            )
          `)
          .eq('user_id', userId)
          .order('joined_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null } as const),
    supabase
      .from('communities')
      .select('id, name, slug, icon_url, members_count, posts_count')
      .eq('type', 'public')
      .order('members_count', { ascending: false })
      .order('posts_count', { ascending: false })
      .limit(3),
    supabase
      .from('tags')
      .select('name, slug, usage_count')
      .order('usage_count', { ascending: false })
      .limit(5),
  ])

  if (usersError) logger.warn('Failed to fetch homepage total users, defaulting to 0:', usersError)
  if (contentsError) logger.warn('Failed to fetch homepage total contents, defaulting to 0:', contentsError)
  if (communitiesError) logger.warn('Failed to fetch homepage total communities, defaulting to 0:', communitiesError)
  if (joinedError) logger.warn('Failed to fetch homepage joined communities, defaulting to empty:', joinedError)
  if (trendingError) logger.warn('Failed to fetch homepage trending communities, defaulting to empty:', trendingError)
  if (tagsError) logger.warn('Failed to fetch homepage popular tags, defaulting to empty:', tagsError)

  return {
    stats: {
      totalUsers: totalUsers || 0,
      totalContents: totalContents || 0,
      totalCommunities: totalCommunities || 0,
    },
    userCommunities: ((joinedCommunities || []) as JoinedCommunityRecord[])
      .map((item) => Array.isArray(item.community) ? item.community[0] : item.community)
      .filter(isHomepageCommunityItem),
    trendingCommunities: trendingCommunities || [],
    popularTags: (popularTags || []).map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      count: tag.usage_count || 0,
    })),
  }
}
