import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCommunities, getUserCommunities, getTrendingCommunities } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Users, Plus } from 'lucide-react'
import { Metadata } from 'next'

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

async function CommunitiesList({ type }: { type: 'all' | 'joined' | 'trending' }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let communities = []

  if (type === 'joined' && user) {
    const { data } = await getUserCommunities(user.id)
    communities = data.map(m => m.community)
  } else if (type === 'trending') {
    const { data } = await getTrendingCommunities(20)
    communities = data
  } else {
    const { data } = await getCommunities({ type: 'public', limit: 50 })
    communities = data
  }

  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {type === 'joined' ? '你还没有加入任何社区' : '暂无社区'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {communities.map((community: any) => (
        <Link key={community.id} href={`/communities/${community.slug}`}>
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              {community.icon_url ? (
                <img
                  src={community.icon_url}
                  alt={community.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{community.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {community.description || '暂无描述'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{community.members_count} 成员</span>
                  <span>{community.posts_count} 帖子</span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default async function CommunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">社区</h1>
          <p className="text-muted-foreground mt-1">发现和加入感兴趣的社区</p>
        </div>
        {user && (
          <Link href="/communities/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建社区
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">全部</TabsTrigger>
          {user && <TabsTrigger value="joined">已加入</TabsTrigger>}
          <TabsTrigger value="trending">热门</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Suspense fallback={<div>加载中...</div>}>
            <CommunitiesList type="all" />
          </Suspense>
        </TabsContent>

        {user && (
          <TabsContent value="joined" className="mt-6">
            <Suspense fallback={<div>加载中...</div>}>
              <CommunitiesList type="joined" />
            </Suspense>
          </TabsContent>
        )}

        <TabsContent value="trending" className="mt-6">
          <Suspense fallback={<div>加载中...</div>}>
            <CommunitiesList type="trending" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
