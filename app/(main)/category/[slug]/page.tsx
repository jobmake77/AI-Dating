import { notFound } from 'next/navigation'
import { getContents } from '@/lib/queries/content'
import { CATEGORIES, type CategorySlug } from '@/lib/constants/categories'
import { CategoryNav } from '@/components/category/category-nav'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  // Validate category slug
  if (!(slug in CATEGORIES)) {
    notFound()
  }

  const category = CATEGORIES[slug as CategorySlug]
  const IconComponent = category.icon

  // Fetch contents for this category
  // Note: Category filtering is removed, showing all contents for now
  const { contents, totalPages } = await getContents({
    page,
    limit: 12,
  })

  return (
    <div className="container py-8 space-y-8">
      {/* Category Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <IconComponent className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>
        </div>

        {/* Category Navigation */}
        <CategoryNav />
      </div>

      {/* Content List */}
      {contents.length > 0 ? (
        <>
          <ContentList contents={contents} />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} basePath={`/category/${slug}`} />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">该板块暂无内容</p>
        </div>
      )}
    </div>
  )
}
