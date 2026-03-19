import { getContentsFeed } from '@/lib/queries/content'
import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import type { Metadata } from 'next'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()

  return {
    title: getTranslation(locale, 'contentsPage.metadata.title', 'Contents - AI-Dating'),
    description: getTranslation(
      locale,
      'contentsPage.metadata.description',
      'Browse technical articles, tutorials, deep dives, and public community posts on AI-Dating.'
    ),
  }
}

interface ContentsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ContentsPage({ searchParams }: ContentsPageProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `contentsPage.${key}`, fallback)
  const params = await searchParams
  const page = Number(params.page) || 1

  const { contents, totalPages } = await getContentsFeed({ page })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title', 'All content')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle', 'Browse technical articles, tutorials, deep dives, and trending posts from public communities.')}
        </p>
      </div>

      <ContentList contents={contents} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/contents" />
    </div>
  )
}
