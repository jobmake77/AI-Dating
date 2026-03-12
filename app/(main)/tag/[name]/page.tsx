import { getContents } from '@/lib/queries/content'
import { ContentListCompact } from '@/components/content/content-list-compact'
import { Metadata } from 'next'
import { TagHeader } from '@/components/tag/tag-header'
import { FeedTabs } from '@/components/feed/feed-tabs'

interface TagPageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ page?: string; tab?: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { name } = await params
  const tagName = decodeURIComponent(name)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 获取标签内容数量
  const { total } = await getContents({ page: 1, tag: tagName, limit: 1 })

  return {
    title: `#${tagName}`,
    description: `浏览 AI-Dating 上关于 ${tagName} 的所有内容。共有 ${total} 篇文章使用了这个标签。`,
    keywords: [tagName, 'AI', '技术', '开发者'],
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: `${baseUrl}/tag/${encodeURIComponent(tagName)}`,
      title: `#${tagName} - AI-Dating`,
      description: `浏览 AI-Dating 上关于 ${tagName} 的所有内容`,
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
      description: `浏览 AI-Dating 上关于 ${tagName} 的所有内容`,
      images: ['/og-image.png'],
    },
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { name } = await params
  const { page: pageParam, tab = 'new' } = await searchParams
  const page = Number(pageParam) || 1

  const tagName = decodeURIComponent(name)

  const { contents, totalPages, total } = await getContents({ page, tag: tagName })

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
              <p className="text-xs text-muted-foreground">该标签暂无内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
