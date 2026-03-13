import { ContentCard } from './content-card-twitter'
import { EmptyState } from '@/components/empty-state'
import { FileText } from 'lucide-react'
import type { ContentListItem } from '@/lib/types/content'

interface ContentListProps {
  contents: ContentListItem[]
  isAuthenticated?: boolean
}

export function ContentList({ contents, isAuthenticated = false }: ContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          icon={FileText}
          title="暂无内容"
          description="成为第一个分享内容的人"
        />
      </div>
    )
  }

  return (
    <div>
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
