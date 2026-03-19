import { CompactContentCard } from './compact-content-card'
import { EmptyState } from '@/components/empty-state'
import { FileText } from 'lucide-react'
import type { ContentListItem } from '@/lib/types/content'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

interface ContentListCompactProps {
  contents: ContentListItem[]
  isAuthenticated?: boolean
}

export async function ContentListCompact({ contents }: ContentListCompactProps) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `contentUi.${key}`, fallback)
  if (contents.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={FileText}
          title={t('emptyTitle', '暂无内容')}
          description={t('emptyDescription', '成为第一个分享内容的人')}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-card">
      {contents.map((content, index) => (
        <CompactContentCard
          key={content.id}
          content={content}
          index={index}
        />
      ))}
    </div>
  )
}
