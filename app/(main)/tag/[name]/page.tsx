import { getContents } from '@/lib/queries/content'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import { notFound } from 'next/navigation'

interface TagPageProps {
  params: Promise<{ name: string }>
  searchParams: Promise<{ page?: string }>
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
