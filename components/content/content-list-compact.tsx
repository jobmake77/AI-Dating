import { CompactContentCard } from './compact-content-card'
import { EmptyState } from '@/components/empty-state'
import { FileText } from 'lucide-react'

interface ContentListCompactProps {
  contents: any[]
  isAuthenticated?: boolean
}

export function ContentListCompact({ contents, isAuthenticated = false }: ContentListCompactProps) {
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
