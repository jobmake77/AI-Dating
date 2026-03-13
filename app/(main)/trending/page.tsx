import { getTrendingContents } from '@/lib/actions/recommendations'
import { TrendingContentCard } from '@/components/content/trending-content-card'
import { TrendingTimeFilter } from '@/components/content/trending-time-filter'
import { Flame } from 'lucide-react'
import { Metadata } from 'next'
import type { TrendingContentItem } from '@/lib/types/content'

export const metadata: Metadata = {
  title: '热门内容 - AI-Dating',
  description: '发现 AI-Dating 社区最热门的内容、项目和讨论。探索最受欢迎的 AI 技术分享和开发经验。',
  keywords: ['热门', '趋势', 'AI', '技术分享', '开发者社区'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/trending`,
    title: '热门内容 - AI-Dating',
    description: '发现 AI-Dating 社区最热门的内容、项目和讨论',
    siteName: 'AI-Dating',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?type=home`,
        width: 1200,
        height: 630,
        alt: '热门内容',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '热门内容 - AI-Dating',
    description: '发现 AI-Dating 社区最热门的内容、项目和讨论',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?type=home`],
  },
}

interface TrendingPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams
  const timeRange = (params.range as 'day' | 'week' | 'month' | 'all') || 'week'

  const trendingContents: TrendingContentItem[] = await getTrendingContents({
    timeRange,
    limit: 20,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl gradient-warm flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">热门内容</h1>
            <p className="text-xs text-muted-foreground mt-0.5">社区中最受欢迎的内容</p>
          </div>
        </div>

        <div className="mb-5">
          <TrendingTimeFilter currentRange={timeRange} />
        </div>

        <div className="space-y-2">
          {trendingContents.map((content, index) => (
            <TrendingContentCard
              key={content.id}
              content={content}
              rank={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
