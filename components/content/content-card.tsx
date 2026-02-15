import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { TagList } from '@/components/tag/tag-list'
import { Heart, Repeat2, MessageCircle } from 'lucide-react'
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
    likes_count: number
    reposts_count: number
    comments_count: number
    created_at: string
    users: {
      username: string
      avatar: string | null
      full_name: string | null
    }
    is_repost?: boolean
    reposted_by?: {
      username: string
      avatar: string | null
      full_name: string | null
    }
    reposted_at?: string
  }
}

export function ContentCard({ content }: ContentCardProps) {
  const displayTime = content.is_repost && content.reposted_at
    ? content.reposted_at
    : content.created_at

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        {content.is_repost && content.reposted_by && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Repeat2 className="h-4 w-4" />
            <Link
              href={`/u/${content.reposted_by.username}`}
              className="hover:text-primary transition-colors"
            >
              {content.reposted_by.full_name || content.reposted_by.username}
            </Link>
            <span>转发了</span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          {content.price_type === 'member' && (
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
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {content.comments_count}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="h-3.5 w-3.5" />
            {content.reposts_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {content.likes_count}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
