import { ContentList } from '@/components/content/content-list'
import { Pagination } from '@/components/content/pagination'
import type { ContentListItem } from '@/lib/types/content'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface UserContentsProps {
  contents: ContentListItem[]
  username: string
  currentPage: number
  totalPages: number
}

export async function UserContents({ contents, username, currentPage, totalPages }: UserContentsProps) {
  const locale = await getRequestLocale()
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{getTranslation(locale, 'userContentTabs.heading', 'Published content')}</h2>
      <ContentList contents={contents} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/u/${username}`}
      />
    </div>
  )
}
