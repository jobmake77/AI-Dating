import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEvents } from '@/lib/queries/events'
import { EventCard } from '@/components/events/event-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '活动 - AI-Dating',
  description: '发现和参与 AI 开发者线下活动。技术分享、项目展示、社交聚会，与开发者面对面交流。',
  keywords: ['活动', 'AI', '线下活动', '技术分享', '开发者聚会'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/events`,
    title: '活动 - AI-Dating',
    description: '发现和参与 AI 开发者线下活动',
    siteName: 'AI-Dating',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?type=home`,
        width: 1200,
        height: 630,
        alt: '活动',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '活动 - AI-Dating',
    description: '发现和参与 AI 开发者线下活动',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?type=home`],
  },
}

async function EventsList({ type }: { type: 'official' | 'offline' }) {
  const { data: events } = await getEvents({ type, limit: 50 })

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {type === 'official' ? '暂无官方活动' : '暂无线下活动'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">活动</h1>
          <p className="text-muted-foreground mt-1">发现和参与精彩活动</p>
        </div>
        {user && (
          <Link href="/events/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              发起活动
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="official" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="official">官方活动</TabsTrigger>
          <TabsTrigger value="offline">线下活动</TabsTrigger>
        </TabsList>

        <TabsContent value="official" className="mt-6">
          <Suspense fallback={<div>加载中...</div>}>
            <EventsList type="official" />
          </Suspense>
        </TabsContent>

        <TabsContent value="offline" className="mt-6">
          <Suspense fallback={<div>加载中...</div>}>
            <EventsList type="offline" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
