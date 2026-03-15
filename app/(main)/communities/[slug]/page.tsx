import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getUserMembershipStatus } from '@/lib/queries/communities'
import { getCommunityPosts } from '@/lib/queries/community-posts'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Settings, Plus, Lock, ArrowLeft, ThumbsUp, MessageCircle, Pin, Shield, Calendar } from 'lucide-react'
import { joinCommunity, leaveCommunity } from '@/lib/actions/communities'
import { Metadata } from 'next'
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'
import { CommunityFeedTabs } from '@/components/community/community-feed-tabs'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: community } = await getCommunityBySlug(slug)
  if (!community) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const ogImageUrl = `${baseUrl}/api/og?type=community&name=${encodeURIComponent(community.name)}&desc=${encodeURIComponent(community.description || '')}&members=${community.members_count}`

  return {
    title: `${community.name} - AI-Dating 社区`,
    description: community.description || `${community.name} 社区，${community.members_count} 位成员`,
    keywords: ['社区', 'AI', community.name],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: `${baseUrl}/communities/${community.slug}`,
      title: community.name,
      description: community.description || `${community.name} 社区`,
      siteName: 'AI-Dating',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: community.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: community.name,
      description: community.description || `${community.name} 社区`,
      images: [ogImageUrl],
    },
  }
}

async function CommunityHeader({ slug }: { slug: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: community } = await getCommunityBySlug(slug)
  if (!community) return null

  let membership = null
  if (user) {
    const { data } = await getUserMembershipStatus(community.id, user.id)
    membership = data
  }

  const isMember = !!membership
  const isAdmin = membership?.role === 'admin'
  const isModerator = membership?.role === 'moderator'
  const isCreator = user?.id === community.creator_id
  const canOpenSettings = isCreator || isAdmin
  const canManageMembers = isCreator || isAdmin || isModerator

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm mb-4">
      {/* Gradient Banner */}
      <div className="h-20 bg-gradient-to-r from-primary/20 via-accent/10 to-blue-500/20" />

      <div className="px-5 pb-5 -mt-6">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-3">
            {/* Community Avatar */}
            {community.icon_url ? (
              <Image
                src={community.icon_url}
                alt={community.name}
                width={64}
                height={64}
                unoptimized
                className="w-16 h-16 rounded-xl bg-card shadow-sm border border-border object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
            )}

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{community.name}</h1>
                {community.type === 'private' && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                {community.description}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pb-1">
            {user && (
              <>
                {canManageMembers && (
                  <Link href={`/communities/${slug}/members`}>
                    <Button variant="outline" size="sm" className="h-9 text-xs border-border">
                      <Shield className="h-3.5 w-3.5 mr-1.5" />
                      成员管理
                    </Button>
                  </Link>
                )}
                {canOpenSettings && (
                  <Link href={`/communities/${slug}/settings`}>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-border">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
                {isMember ? (
                  <>
                    <Link href={`/communities/${slug}/posts/create`}>
                      <Button size="sm" className="h-9 text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        发帖
                      </Button>
                    </Link>
                    <form action={async () => {
                      'use server'
                      await leaveCommunity(community.id)
                    }}>
                      <Button variant="outline" size="sm" className="h-9 text-xs" type="submit">
                        退出社区
                      </Button>
                    </form>
                  </>
                ) : (
                  <form action={async () => {
                    'use server'
                    await joinCommunity(community.id)
                  }}>
                    <Button size="sm" className="h-9 text-xs" type="submit">
                      加入社区
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono font-bold text-foreground">
              {community.members_count >= 1000
                ? `${(community.members_count / 1000).toFixed(1)}k`
                : community.members_count}
            </span> 成员
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="font-mono font-bold text-foreground">{community.posts_count}</span> 帖子
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            创建于 {new Date(community.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  )
}

async function PostsList({ communityId, sortBy }: { communityId: string; sortBy: 'latest' | 'popular' }) {
  const { data: posts } = await getCommunityPosts(communityId, { sortBy, limit: 50 })
  type CommunityPost = Awaited<ReturnType<typeof getCommunityPosts>>['data'][number]

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">还没有帖子</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {posts.map((post: CommunityPost) => (
        <Link key={post.id} href={`/communities/${post.community.slug}/posts/${post.id}`}>
          <article className="group flex items-start gap-0 rounded-lg border border-border bg-card transition-all hover:border-primary/20 hover:shadow-sm">
            {/* Category color bar */}
            <div className="w-1 self-stretch rounded-l-lg shrink-0 bg-primary" />

            <div className="flex-1 min-w-0 flex items-start gap-3 p-3">
              {/* Vote column */}
              <div className="flex flex-col items-center gap-0 shrink-0">
                <span
                  className="rounded p-0.5 text-muted-foreground transition-all group-hover:text-primary"
                  aria-hidden="true"
                >
                  <ThumbsUp className="h-4 w-4" />
                </span>
                <span className="font-mono text-[11px] font-bold text-foreground leading-none my-0.5">
                  {post.likes_count}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {post.is_pinned && (
                    <Pin className="h-3 w-3 text-primary shrink-0" />
                  )}
                  <h3 className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {post.title || post.content.substring(0, 100)}
                  </h3>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="font-medium text-link hover:underline">
                    {post.author.display_name || post.author.username}
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                  {post.is_locked && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>

                {/* Preview text */}
                {post.title && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-1">
                    {post.content}
                  </p>
                )}
              </div>

              {/* Stats columns */}
              <div className="hidden sm:flex items-center gap-4 shrink-0 text-[11px] text-muted-foreground">
                <div className="flex flex-col items-center w-12">
                  <span className="font-mono font-bold text-foreground">{post.comments_count}</span>
                  <span className="text-[10px] flex items-center gap-0.5">
                    <MessageCircle className="h-2.5 w-2.5" /> 回复
                  </span>
                </div>
                <div className="flex flex-col items-center w-12">
                  <span className="font-mono font-bold text-foreground">{post.likes_count}</span>
                  <span className="text-[10px] flex items-center gap-0.5">
                    <ThumbsUp className="h-2.5 w-2.5" /> 点赞
                  </span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}

async function CommunityRulesSidebar({ communityId }: { communityId: string }) {
  const supabase = await createClient()

  // Fetch community management team
  const { data: managementTeam } = await supabase
    .from('community_members')
    .select(`
      role,
      users!inner (
        id,
        username,
        full_name,
        avatar
      )
    `)
    .eq('community_id', communityId)
    .in('role', ['admin', 'moderator'])
    .order('role', { ascending: true })

  type MemberWithUser = {
    role: string
    users: Array<{
      id: string
      username: string
      full_name: string | null
      avatar: string | null
    }>
  }

  const members = (managementTeam || []) as MemberWithUser[]

  // In a real implementation, fetch rules from database
  const rules = [
    '保持友善，尊重他人',
    '内容需与社区主题相关',
    '禁止广告和垃圾信息',
    '遵守社区发帖规范'
  ]

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-4 space-y-3">
        {/* Management Team */}
        {members && members.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="font-mono text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              管理团队
            </h3>
            <div className="space-y-2">
              {members.map((member) => {
                const user = member.users[0]
                if (!user) return null
                return (
                  <Link
                    key={user.id}
                    href={`/u/${user.username}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Image
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.full_name || user.username}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === 'admin' ? '管理员' : '版主'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Community Rules */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="font-mono text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-yellow-500" />
            社区规则
          </h3>
          <ol className="space-y-2">
            {rules.map((rule, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-muted-foreground">
                <span className="font-mono text-primary font-bold shrink-0">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  )
}

async function CommunityContent({ communityId }: { communityId: string }) {
  return (
    <div className="flex gap-4">
      <main className="flex-1 min-w-0 space-y-3">
        <CommunityFeedTabs activeTab="latest" />
        <Suspense fallback={<div className="text-sm text-muted-foreground">加载中...</div>}>
          <PostsList communityId={communityId} sortBy="latest" />
        </Suspense>
      </main>

      <CommunityRulesSidebar communityId={communityId} />
    </div>
  )
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { data: community } = await getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 检查私密社区权限
  if (community.type === 'private' && user) {
    const { data: membership } = await getUserMembershipStatus(community.id, user.id)
    if (!membership) {
      redirect('/communities')
    }
  }

  // Generate structured data
  const organizationSchema = getOrganizationSchema({
    name: community.name,
    description: community.description,
    url: `/communities/${community.slug}`,
    logo: community.icon_url,
    memberCount: community.members_count,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: '首页', url: '/' },
    { name: '社区', url: '/communities' },
    { name: community.name, url: `/communities/${community.slug}` },
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-4">
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          所有社区
        </Link>

        <CommunityHeader slug={slug} />

          <CommunityContent communityId={community.id} />
      </div>
    </div>
  )
}
