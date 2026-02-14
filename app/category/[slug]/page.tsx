import { getContents } from '@/lib/queries/content'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import { CategoryNav } from '@/components/category/category-nav'
import { CATEGORIES } from '@/lib/constants/categories'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const category = CATEGORIES[slug as keyof typeof CATEGORIES]
  if (!category) {
    notFound()
  }

  const { contents, totalPages } = await getContents({ page, category: slug })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {category.icon} {category.name}
        </h1>
        <p className="text-muted-foreground mt-2">{category.description}</p>
      </div>

      <CategoryNav currentSlug={slug} />

      <ContentList contents={contents} />
      <Pagination currentPage={page} totalPages={totalPages} basePath={`/category/${slug}`} />
    </div>
  )
}
