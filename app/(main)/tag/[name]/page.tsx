import { getContents } from '@/lib/queries/content'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface TagPageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ page?: string }>
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
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const tagName = decodeURIComponent(name)

  const { contents, totalPages, total } = await getContents({ page, tag: tagName })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span className="text-primary">#</span>
          {tagName}
        </h1>
        <p className="text-muted-foreground mt-2">
          {total} 篇内容使用了这个标签
        </p>
      </div>

      <ContentList contents={contents} />
      <Pagination currentPage={page} totalPages={totalPages} basePath={`/tag/${encodeURIComponent(tagName)}`} />
    </div>
  )
}
