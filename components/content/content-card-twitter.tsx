import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { TagList } from '@/components/tag/tag-list'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Clock, Eye, User } from 'lucide-react'

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
      avatar: string | null
      full_name: string | null
    }
  }
}

export function ContentCard({ content }: ContentCardProps) {
  return (
    <article className="border-b border-border py-6 px-4 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex gap-4">
        {/* Avatar */}
        <Link href={`/u/${content.users.username}`} className="flex-shrink-0">
          {content.users.avatar ? (
            <img
              src={content.users.avatar}
              alt={content.users.full_name || content.users.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author and Time */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Link
              href={`/u/${content.users.username}`}
              className="font-semibold hover:underline"
            >
              {content.users.full_name || content.users.username}
            </Link>
            <span className="text-muted-foreground">@{content.users.username}</span>
            <span className="text-muted-foreground">·</span>
            <time className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(content.created_at), {
                addSuffix: true,
                locale: zhCN,
              })}
            </time>
            {content.price_type === 'member_only' && (
              <>
                <span className="text-muted-foreground">·</span>
                <Badge variant="secondary" className="text-xs">
                  会员专享
                </Badge>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${content.id}`} className="block group">
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {content.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {content.excerpt}
          </p>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mb-3">
              <TagList tags={content.tags} />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{content.reading_time} 分钟阅读</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{content.view_count} 浏览</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
