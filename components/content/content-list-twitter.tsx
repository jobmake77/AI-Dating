import { ContentCard } from './content-card-twitter'
import { EmptyState } from '@/components/empty-state'
import { FileText } from 'lucide-react'

interface ContentListProps {
  contents: any[]
  isAuthenticated?: boolean
}

export function ContentList({ contents, isAuthenticated = false }: ContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="border border-border rounded-xl bg-card/30 p-8">
        <EmptyState
          icon={FileText}
          title="暂无内容"
          description="成为第一个分享内容的人"
        />
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      {contents.map((content, index) => (
        <ContentCard
          key={content.id}
          content={content}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
