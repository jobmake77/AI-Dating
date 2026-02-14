import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TagList } from '@/components/tag/tag-list'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ContentCardProps {
  content: {
    id: string
    title: string
    excerpt: string
    tags: string[] | null
    price_type: string
    reading_time: number
    view_count: number
    created_at: string
    users: {
      username: string
      avatar_url: string | null
      full_name: string | null
    }
  }
}

export function ContentCard({ content }: ContentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          {content.price_type === 'member_only' && (
            <Badge variant="default">会员专享</Badge>
          )}
        </div>
        <Link href={`/post/${content.id}`}>
          <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
            {content.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground line-clamp-3">{content.excerpt}</p>
        {content.tags && content.tags.length > 0 && (
          <TagList tags={content.tags} />
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Link
            href={`/u/${content.users.username}`}
            className="hover:text-primary transition-colors"
          >
            {content.users.full_name || content.users.username}
          </Link>
          <span>{content.reading_time} 分钟</span>
          <span>{content.view_count} 浏览</span>
        </div>
        <time>
          {formatDistanceToNow(new Date(content.created_at), {
            addSuffix: true,
            locale: zhCN,
          })}
        </time>
      </CardFooter>
    </Card>
  )
}
