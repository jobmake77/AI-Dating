import { ContentCard } from './content-card'

interface ContentListProps {
  contents: any[]
}

export function ContentList({ contents }: ContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无内容</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  )
}
