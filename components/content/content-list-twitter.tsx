import { ContentCard } from './content-card-twitter'

interface ContentListProps {
  contents: any[]
}

export function ContentList({ contents }: ContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-16 border border-border rounded-lg">
        <p className="text-muted-foreground text-lg">暂无内容</p>
        <p className="text-muted-foreground text-sm mt-2">
          成为第一个分享内容的人
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {contents.map((content, index) => (
        <ContentCard
          key={content.id}
          content={content}
        />
      ))}
    </div>
  )
}
