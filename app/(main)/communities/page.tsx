import { createClient } from '@/lib/supabase/server'
import { getCommunities, getUserCommunities, getTrendingCommunities } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Metadata } from 'next'
import { CommunitiesClient } from '@/components/community/communities-client'
import type { CommunityListItem, CommunityMembershipRecord } from '@/lib/types/community'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = getTranslation(locale, 'communitiesPage.metadata.title', 'Communities - AI-Dating')
  const description = getTranslation(
    locale,
    'communitiesPage.metadata.description',
    'Discover and join AI communities that match your interests.'
  )

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      url: `${baseUrl}/communities`,
      title,
      description,
      siteName: 'AI-Dating',
      images: [
        {
          url: `${baseUrl}/api/og?type=home`,
          width: 1200,
          height: 630,
          alt: getTranslation(locale, 'communitiesPage.metadata.imageAlt', 'Communities'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/api/og?type=home`],
    },
  }
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
  const locale = await getRequestLocale()
  const t = (key: string, fallback?: string) => getTranslation(locale, `communitiesPage.${key}`, fallback)
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
          <h1 className="text-xl font-bold text-foreground">{t('title', '社区')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('subtitle', '发现并加入感兴趣的技术社区')}
          </p>
        </div>
        {user && (
          <Link href="/communities/create">
            <Button
              size="sm"
              className="h-9 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('create', '创建社区')}
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
