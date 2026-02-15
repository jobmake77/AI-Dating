import { ContentCard } from './content-card-twitter'

interface ContentListProps {
  contents: any[]
}

export function ContentList({ contents }: ContentListProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-20 border border-border rounded-xl bg-card/30">
        <p className="text-muted-foreground text-base font-medium">暂无内容</p>
        <p className="text-muted-foreground text-sm mt-1.5">
          成为第一个分享内容的人
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      {contents.map((content, index) => (
        <ContentCard
          key={content.id}
          content={content}
        />
      ))}
    </div>
  )
}
