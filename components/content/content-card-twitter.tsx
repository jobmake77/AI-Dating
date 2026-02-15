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
    <article className="border-b border-border last:border-b-0 py-4 px-6 hover:bg-muted/30 transition-colors duration-200">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/u/${content.users.username}`} className="flex-shrink-0 cursor-pointer">
          {content.users.avatar ? (
            <img
              src={content.users.avatar}
              alt={content.users.full_name || content.users.username}
              className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author and Time */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Link
              href={`/u/${content.users.username}`}
              className="font-semibold text-sm hover:underline cursor-pointer"
            >
              {content.users.full_name || content.users.username}
            </Link>
            <span className="text-muted-foreground text-sm">@{content.users.username}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <time className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(content.created_at), {
                addSuffix: true,
                locale: zhCN,
              })}
            </time>
            {content.price_type === 'member' && (
              <>
                <span className="text-muted-foreground text-sm">·</span>
                <Badge variant="secondary" className="text-xs h-5">
                  会员专享
                </Badge>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={`/post/${content.id}`} className="block group cursor-pointer">
            <h2 className="text-lg font-bold mb-1.5 group-hover:text-primary transition-colors duration-150 line-clamp-2 leading-snug">
              {content.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <Link href={`/post/${content.id}`} className="block group cursor-pointer">
            <p className="text-muted-foreground text-[15px] mb-3 line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors duration-150">
              {content.excerpt}
            </p>
          </Link>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mb-2.5">
              <TagList tags={content.tags} />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
              <Clock className="w-4 h-4" />
              <span>{content.reading_time} 分钟</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
              <Eye className="w-4 h-4" />
              <span>{content.view_count} 浏览</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
