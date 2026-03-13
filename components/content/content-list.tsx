import { ContentCard } from './content-card'
import { FileText } from 'lucide-react'
import type { ContentListItem } from '@/lib/types/content'

interface ContentListProps {
  contents: ContentListItem[]
}

export function ContentList({ contents }: ContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-16 border-b border-border/50">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground text-lg">暂无内容</p>
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
