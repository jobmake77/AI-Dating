import { ContentCard } from './content-card'
import { FileText } from 'lucide-react'
import type { ContentListItem } from '@/lib/types/content'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface ContentListProps {
  contents: ContentListItem[]
}

export async function ContentList({ contents }: ContentListProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `contentUi.${key}`, fallback)
  if (contents.length === 0) {
    return (
      <div className="text-center py-16 border-b border-border/50">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">{t('emptyTitle', '暂无内容')}</p>
      </div>
    )
  }

  return (
    <div className="border-t border-border/50">
      {contents.map((content) => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  )
}
