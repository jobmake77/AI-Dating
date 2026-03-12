import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEvents } from '@/lib/queries/events'
import { EventsListClient } from '@/components/events/events-list-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
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

async function EventsList() {
  const { data: events } = await getEvents({ limit: 50 })

  return <EventsListClient events={events} />
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-sunset flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">活动</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                参与社区活动，提升技能、拓展人脉
              </p>
            </div>
          </div>
          {user && (
            <Button
              size="sm"
              className="h-9 gap-1.5 gradient-primary text-white hover:opacity-90 text-xs shadow-primary"
              asChild
            >
              <Link href="/events/create">
                <Plus className="h-3.5 w-3.5" />
                创建活动
              </Link>
            </Button>
          )}
        </div>

        <Suspense fallback={<div>加载中...</div>}>
          <EventsList />
        </Suspense>
      </div>
    </div>
  )
}
