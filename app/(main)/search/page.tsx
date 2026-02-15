import { searchContents } from '@/lib/queries/search'
import { ContentList } from '@/components/content/content-list-twitter'
import { Pagination } from '@/components/content/pagination'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const page = Number(params.page) || 1

  if (!query) {
    return (
      <div className="container max-w-[1280px] mx-auto px-4 py-16">
        <div className="text-center">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">搜索内容</h1>
          <p className="text-muted-foreground">
            在顶部搜索框输入关键词开始搜索
          </p>
        </div>
      </div>
    )
  }

  const { contents, totalPages, totalResults } = await searchContents(query, page)

  return (
    <div className="container max-w-[1280px] mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            搜索结果："{query}"
          </h1>
          <p className="text-muted-foreground">
            找到 {totalResults} 个结果
          </p>
        </div>

        {/* Results */}
        {contents.length > 0 ? (
          <>
            <ContentList contents={contents} />

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  basePath={`/search?q=${encodeURIComponent(query)}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-border rounded-xl bg-card/30">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-base font-medium">
              没有找到相关内容
            </p>
            <p className="text-muted-foreground text-sm mt-1.5">
              尝试使用不同的关键词
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
