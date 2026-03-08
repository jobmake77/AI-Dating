import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityBySlug, getUserMembershipStatus } from '@/lib/queries/communities'
import { getCommunityPosts } from '@/lib/queries/community-posts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { Users, Settings, Plus, Lock } from 'lucide-react'
import { joinCommunity, leaveCommunity } from '@/lib/actions/communities'
import { Metadata } from 'next'
import { getOrganizationSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const { data: community } = await getCommunityBySlug(slug)
    if (!community) {
      return {
        title: '社区未找到',
        description: '该社区不存在',
      }
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
  } catch (error) {
    return {
      title: '社区未找到',
      description: '该社区不存在',
    }
  }
}


async function handleJoin(communityId: string): Promise<void> {
  'use server'
  await joinCommunity(communityId)
}

async function handleLeave(communityId: string): Promise<void> {
  'use server'
  await leaveCommunity(communityId)
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

  return (
    <div className="border-b bg-card">
      <div className="container max-w-6xl py-6">
        {community.cover_url && (
          <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
            <img
              src={community.cover_url}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start gap-4">
          {community.icon_url ? (
            <img
              src={community.icon_url}
              alt={community.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              {community.type === 'private' && (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground mt-1">{community.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{community.members_count} 成员</span>
              <span>{community.posts_count} 帖子</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <>
                {isMember ? (
                  <>
                    <Link href={`/communities/${slug}/posts/create`}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        发帖
                      </Button>
                    </Link>
                    <form action={handleLeave.bind(null, community.id)}>
                      <Button variant="outline" type="submit">
                        退出社区
                      </Button>
                    </form>
                  </>
                ) : (
                  <form action={handleJoin.bind(null, community.id)}>
                    <Button type="submit">加入社区</Button>
                  </form>
                )}
                {isAdmin && (
                  <Link href={`/communities/${slug}/settings`}>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Link href={`/communities/${slug}`}>
            <Button variant="ghost">帖子</Button>
          </Link>
          <Link href={`/communities/${slug}/members`}>
            <Button variant="ghost">成员</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

async function PostsList({ communityId, sortBy }: { communityId: string; sortBy: 'latest' | 'popular' }) {
  const { data: posts } = await getCommunityPosts(communityId, { sortBy, limit: 50 })

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">还没有帖子</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <Link key={post.id} href={`/communities/${post.community.slug}/posts/${post.id}`}>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <img
                src={post.author.avatar || '/default-avatar.png'}
                alt={post.author.full_name || post.author.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {post.author.full_name || post.author.username}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  {post.is_pinned && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      置顶
                    </span>
                  )}
                  {post.is_locked && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                {post.title && (
                  <h3 className="font-semibold mt-1">{post.title}</h3>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {post.content}
                </p>
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {post.images.slice(0, 3).map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        className="w-20 h-20 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>👍 {post.likes_count}</span>
                  <span>💬 {post.comments_count}</span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
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
    <div>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CommunityHeader slug={slug} />

      <div className="container max-w-6xl py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/communities">社区</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{community.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs defaultValue="latest" className="w-full">
          <TabsList>
            <TabsTrigger value="latest">最新</TabsTrigger>
            <TabsTrigger value="popular">热门</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="mt-6">
            <Suspense fallback={<div>加载中...</div>}>
              <PostsList communityId={community.id} sortBy="latest" />
            </Suspense>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <Suspense fallback={<div>加载中...</div>}>
              <PostsList communityId={community.id} sortBy="popular" />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
