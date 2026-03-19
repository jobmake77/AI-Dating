import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ExploreClient } from '@/components/content/explore-client'
import { getCategories, getPopularTags, getExploreContents } from '@/lib/queries/explore'
import { getTranslation } from '@/i18n/dictionaries'
import { getRequestLocale } from '@/i18n/request'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()

  return {
    title: getTranslation(locale, 'explorePage.metadata.title', 'Explore - AI-Dating'),
    description: getTranslation(
      locale,
      'explorePage.metadata.description',
      'Explore AI-Dating topics by category and tag to discover the content you care about.'
    ),
  }
}

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string
    tag?: string
    page?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const category = params.category || ''
  const tag = params.tag || ''
  const page = parseInt(params.page || '1', 10)

  const [categories, tags, contentsData] = await Promise.all([
    getCategories(),
    getPopularTags(),
    getExploreContents({ category, tag, page, limit: 20 }),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExploreClient
        initialContents={contentsData.contents}
        categories={categories}
        tags={tags}
        activeCategory={category}
        activeTag={tag}
      />
    </Suspense>
  )
}
