import { getTrendingContents } from '@/lib/actions/recommendations'
import { TrendingContentCard } from '@/components/content/trending-content-card'
import { TrendingTimeFilter } from '@/components/content/trending-time-filter'
import { Flame } from 'lucide-react'
import { Metadata } from 'next'
import type { TrendingContentItem } from '@/lib/types/content'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const title = getTranslation(locale, 'trendingPage.metadata.title', 'Trending - AI-Dating')
  const description = getTranslation(locale, 'trendingPage.metadata.description', 'Discover the most popular content on AI-Dating.')

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      url: `${baseUrl}/trending`,
      title,
      description,
      siteName: 'AI-Dating',
      images: [
        {
          url: `${baseUrl}/api/og?type=home`,
          width: 1200,
          height: 630,
          alt: getTranslation(locale, 'trendingPage.metadata.imageAlt', 'Trending'),
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

interface TrendingPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback?: string) => getTranslation(locale, `trendingPage.${key}`, fallback)
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
            <h1 className="text-xl font-bold text-foreground">{t('title', '热门内容')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle', '社区中最受欢迎的内容')}</p>
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
