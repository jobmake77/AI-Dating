import { getUserByUsername } from '@/lib/actions/user'
import { getContents, getUserLikedContents, getUserRepostedContents } from '@/lib/queries/content'
import { getUserStats } from '@/lib/queries/user'
import { checkUserFollowing } from '@/lib/actions/follows'
import { getUserAgents } from '@/lib/actions/agents'
import { createClient } from '@/lib/supabase/server'
import { UserProfileCard } from '@/components/user/user-profile-card'
import { UserContentTabsCompact } from '@/components/user/user-content-tabs-compact'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPersonSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'

type ContentsResult = Awaited<ReturnType<typeof getContents>>
type UserLikedContentsResult = Awaited<ReturnType<typeof getUserLikedContents>>
type UserRepostedContentsResult = Awaited<ReturnType<typeof getUserRepostedContents>>

interface UserPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string; tab?: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params
  const user = await getUserByUsername(username)
  if (!user) {
    notFound()
  }

  const stats = await getUserStats(user.id)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const displayName = user.full_name || user.username
  const description = user.bio || `${displayName} 在 AI-Dating 的个人主页。已发布 ${stats.contents_count} 篇内容，获得 ${stats.total_likes} 个赞。`

  const ogImageUrl = `${baseUrl}/api/og?type=user&name=${encodeURIComponent(displayName)}&username=${encodeURIComponent(user.username)}&bio=${encodeURIComponent(user.bio || '')}&contents=${stats.contents_count}&followers=${user.followers_count || 0}`

  return {
    title: `${displayName} (@${user.username})`,
    description,
    openGraph: {
      type: 'profile',
      locale: 'zh_CN',
      url: `${baseUrl}/u/${user.username}`,
      title: `${displayName} (@${user.username})`,
      description,
      siteName: 'AI-Dating',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: displayName,
        },
      ],
      username: user.username,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} (@${user.username})`,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function UserPage({ params, searchParams }: UserPageProps) {
  const { username } = await params
  const { page: pageParam, tab = 'published' } = await searchParams
  const page = Number(pageParam) || 1

  const user = await getUserByUsername(username)
  if (!user) {
    notFound()
  }

  // Check if current user is the profile owner
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // 严格的权限检查：只有当前用户ID与页面用户ID完全匹配时才是所有者
  const isOwner = !!(currentUser && currentUser.id === user.id)

  // Check if current user is following this user
  let isFollowing = false
  if (currentUser && !isOwner) {
    isFollowing = await checkUserFollowing(user.id, currentUser.id)
  }

  // Get user stats
  const stats = await getUserStats(user.id)

  // 只有本人才加载 agents
  const agents = isOwner ? await getUserAgents() : []

  // 根据当前标签获取对应的内容
  let publishedContents: ContentsResult = { contents: [], totalPages: 0 }
  let likedContents: UserLikedContentsResult = { contents: [], totalPages: 0 }
  let repostedContents: UserRepostedContentsResult = { contents: [], totalPages: 0 }

  if (tab === 'published') {
    publishedContents = await getContents({
      page,
      authorId: user.id,
      status: 'approved',
    })
  } else if (tab === 'liked') {
    likedContents = await getUserLikedContents(user.id, { page })
  } else if (tab === 'reposted') {
    repostedContents = await getUserRepostedContents(user.id, { page })
  }

  // Generate structured data
  const personSchema = getPersonSchema({
    name: user.full_name || user.username,
    username: user.username,
    bio: user.bio,
    image: user.avatar,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: '首页', url: '/' },
    { name: '用户', url: '/u' },
    { name: user.full_name || user.username, url: `/u/${user.username}` },
  ])

  return (
    <div className="container max-w-3xl mx-auto py-4 px-4">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="space-y-4">
        <UserProfileCard
          user={user}
          isOwner={isOwner}
          currentUserId={currentUser?.id}
          isFollowing={isFollowing}
          isAuthenticated={!!currentUser}
          stats={stats}
        />
        <UserContentTabsCompact
          username={username}
          isOwner={isOwner}
          agents={agents}
          contents={{
            published: {
              items: publishedContents.contents,
              currentPage: tab === 'published' ? page : 1,
              totalPages: publishedContents.totalPages,
            },
            liked: {
              items: likedContents.contents,
              currentPage: tab === 'liked' ? page : 1,
              totalPages: likedContents.totalPages,
            },
            reposted: {
              items: repostedContents.contents,
              currentPage: tab === 'reposted' ? page : 1,
              totalPages: repostedContents.totalPages,
            },
          }}
        />
      </div>
    </div>
  )
}
