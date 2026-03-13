import { notFound } from 'next/navigation'
import { getContents } from '@/lib/queries/content'
import { CATEGORIES, type CategorySlug } from '@/lib/constants/categories'
import { CategoryHeader } from '@/components/category/category-header'
import { FeedTabs } from '@/components/feed/feed-tabs'
import { ContentListCompact } from '@/components/content/content-list-compact'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; tab?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam, tab = 'new' } = await searchParams
  const page = Number(pageParam) || 1

  // Validate category slug
  if (!(slug in CATEGORIES)) {
    notFound()
  }

  const category = CATEGORIES[slug as CategorySlug]

  // Fetch contents for this category
  // Note: Category filtering is removed, showing all contents for now
  const { contents } = await getContents({
    page,
    limit: 12,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Category Header Banner */}
      <CategoryHeader category={category} />

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Feed Tabs */}
        <div className="mb-5">
          <FeedTabs activeTab={tab} basePath={`/category/${slug}`} />
        </div>

        {/* Content List */}
        <div className="space-y-1.5">
          {contents.length > 0 ? (
            <ContentListCompact contents={contents} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-10 text-center shadow-card">
              <p className="text-xs text-muted-foreground">该板块暂无内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
