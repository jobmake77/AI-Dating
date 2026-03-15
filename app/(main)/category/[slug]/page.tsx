import { notFound } from 'next/navigation'
import { FeedTabs } from '@/components/feed/feed-tabs'
import { ContentListCompact } from '@/components/content/content-list-compact'
import { getExploreContents } from '@/lib/queries/explore'
import { getContentCategoryBySlug } from '@/lib/queries/content-categories'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; tab?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam, tab = 'latest' } = await searchParams
  const page = Number(pageParam) || 1

  const category = await getContentCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const { contents } = await getExploreContents({
    category: slug,
    page,
    limit: 12,
  })

  const categoryColor = category.color

  return (
    <div className="min-h-screen bg-background">
      <div
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, hsl(${categoryColor} / 0.12), hsl(var(--background)))`,
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-4 w-4 rounded-full"
              style={{ backgroundColor: `hsl(${categoryColor})` }}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {category.description || '围绕这个分类查看社区中的相关内容。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5">
          <FeedTabs activeTab={tab} basePath={`/category/${slug}`} />
        </div>

        <div className="space-y-1.5">
          {contents.length > 0 ? (
            <ContentListCompact contents={contents} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
              <p className="text-xs text-muted-foreground">该分类下暂无内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
