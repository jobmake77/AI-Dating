import { createClient } from '@/lib/supabase/server'
import { getCommunities, getUserCommunities, getTrendingCommunities } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Metadata } from 'next'
import { CommunitiesClient } from '@/components/community/communities-client'
import type { CommunityListItem, CommunityMembershipRecord } from '@/lib/types/community'

export const metadata: Metadata = {
  title: '社区 - AI-Dating',
  description: '发现和加入感兴趣的 AI 开发者社区。与志同道合的开发者交流学习，分享项目经验。',
  keywords: ['社区', 'AI', '开发者', '技术交流', '项目分享'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/communities`,
    title: '社区 - AI-Dating',
    description: '发现和加入感兴趣的 AI 开发者社区',
    siteName: 'AI-Dating',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?type=home`,
        width: 1200,
        height: 630,
        alt: '社区',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '社区 - AI-Dating',
    description: '发现和加入感兴趣的 AI 开发者社区',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?type=home`],
  },
}

function isCommunityListItem(
  community: CommunityMembershipRecord['community']
): community is CommunityListItem {
  return Boolean(
    community &&
      community.id &&
      community.name &&
      community.slug &&
      typeof community.members_count === 'number' &&
      typeof community.posts_count === 'number'
  )
}

export default async function CommunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all data in parallel
  const [allResult, joinedResult, trendingResult] = await Promise.all([
    getCommunities({ type: 'public', limit: 50 }),
    user ? getUserCommunities(user.id) : { data: [], count: 0, error: null },
    getTrendingCommunities(20)
  ])

  // Process communities and add is_joined flag
  const joinedIds = new Set(
    (joinedResult.data as CommunityMembershipRecord[])
      .map((membership) => membership.community?.id)
      .filter((id): id is string => Boolean(id))
  )

  const allCommunities: CommunityListItem[] = allResult.data.map((community) => ({
    ...community,
    is_joined: joinedIds.has(community.id)
  }))

  const joinedCommunities: CommunityListItem[] = (joinedResult.data as CommunityMembershipRecord[])
    .map((membership) => membership.community)
    .filter(isCommunityListItem)
    .map((community) => ({ ...community, is_joined: true }))

  const trendingCommunities: CommunityListItem[] = trendingResult.data.map((community) => ({
    ...community,
    is_joined: joinedIds.has(community.id)
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">社区</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            发现并加入感兴趣的技术社区
          </p>
        </div>
        {user && (
          <Link href="/communities/create">
            <Button
              size="sm"
              className="h-9 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              创建社区
            </Button>
          </Link>
        )}
      </div>

      <CommunitiesClient
        initialTab="all"
        allCommunities={allCommunities}
        joinedCommunities={joinedCommunities}
        trendingCommunities={trendingCommunities}
        showJoined={!!user}
      />
    </div>
  )
}
