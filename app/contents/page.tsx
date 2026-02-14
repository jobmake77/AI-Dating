import { getContents } from '@/lib/queries/content'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'

interface ContentsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ContentsPage({ searchParams }: ContentsPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const { contents, totalPages } = await getContents({ page })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">全部内容</h1>
        <p className="text-muted-foreground mt-2">
          探索技术文章、实战教程和深度分析
        </p>
      </div>

      <ContentList contents={contents} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/contents" />
    </div>
  )
}
