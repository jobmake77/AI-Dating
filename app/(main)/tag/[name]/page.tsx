import { getContents } from '@/lib/queries/content'
import { ContentListCompact } from '@/components/content/content-list-compact'
import { Metadata } from 'next'
import { TagHeader } from '@/components/tag/tag-header'
import { FeedTabs } from '@/components/feed/feed-tabs'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface TagPageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ page?: string; tab?: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const locale = await getRequestLocale()
  const format = (key: string, fallback: string, values?: Record<string, string | number>) =>
    getTranslation(locale, `tagPage.${key}`, fallback).replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? `{${name}}`))
  const { name } = await params
  const tagName = decodeURIComponent(name)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { total } = await getContents({ page: 1, tag: tagName, limit: 1 })
  const tagCount = total ?? 0
  const description = format(
    'metadata.description',
    'Browse all content about {tag}. There are currently {count} posts using this tag.',
    { tag: tagName, count: tagCount }
  )
  const socialDescription = format(
    'metadata.socialDescription',
    'Browse all content about {tag} on AI-Dating.',
    { tag: tagName }
  )

  return {
    title: `#${tagName}`,
    description,
    keywords: [tagName, 'AI-Dating'],
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      url: `${baseUrl}/tag/${encodeURIComponent(tagName)}`,
      title: `#${tagName} - AI-Dating`,
      description: socialDescription,
      siteName: 'AI-Dating',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `#${tagName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${tagName} - AI-Dating`,
      description: socialDescription,
      images: ['/og-image.png'],
    },
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string, values?: Record<string, string | number>) =>
    getTranslation(locale, `tagPage.${key}`, fallback).replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? `{${name}}`))
  const { name } = await params
  const { page: pageParam, tab = 'new' } = await searchParams
  const page = Number(pageParam) || 1

  const tagName = decodeURIComponent(name)

  const { contents, total } = await getContents({ page, tag: tagName })

  return (
    <div className="min-h-screen bg-background">
      {/* Tag Header Banner */}
      <TagHeader tagName={tagName} postCount={total || 0} />

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Feed Tabs */}
        <div className="mb-5">
          <FeedTabs activeTab={tab} basePath={`/tag/${encodeURIComponent(tagName)}`} />
        </div>

        {/* Content List */}
        <div className="space-y-1.5">
          {contents.length > 0 ? (
            <ContentListCompact contents={contents} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
              <p className="text-xs text-muted-foreground">{t('empty', '该标签暂无内容')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
