import Link from 'next/link'
import Image from 'next/image'
import { TagList } from '@/components/tag/tag-list'
import { Clock, Eye, User } from 'lucide-react'
import { ContentCardActions } from './content-card-actions'

function formatTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffH = diffMs / (1000 * 60 * 60)
  if (diffH < 24) {
    const h = Math.max(1, Math.floor(diffH))
    return `${h}h前`
  }
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${m}月${d}日`
}

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
  }
  isAuthenticated?: boolean
}

export function ContentCard({ content, isAuthenticated = false }: ContentCardProps) {
  return (
    <article className="px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors duration-150 cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/u/${content.users.username}`} className="flex-shrink-0 mt-0.5">
          {content.users.avatar ? (
            <Image
              src={content.users.avatar}
              alt={content.users.full_name || content.users.username}
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author and Time */}
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <Link href={`/u/${content.users.username}`} className="font-bold text-[15px] hover:underline leading-tight">
              {content.users.full_name || content.users.username}
            </Link>
            <span className="text-muted-foreground text-[14px]">·</span>
            <time className="text-muted-foreground text-[14px]">
              {formatTime(content.created_at)}
            </time>
          </div>

          {/* Title */}
          <Link href={`/post/${content.id}`} className="block group">
            <h2 className="text-[16px] font-bold mb-1 leading-[1.4] line-clamp-2 group-hover:text-primary transition-colors">
              {content.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <Link href={`/post/${content.id}`} className="block">
            <p className="text-[14px] text-foreground/70 mb-2.5 line-clamp-2 leading-[1.6]">
              {content.excerpt}
            </p>
          </Link>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mb-2.5">
              <TagList tags={content.tags} />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground/60 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{content.reading_time} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{content.view_count}</span>
            </div>
          </div>

          {/* Actions */}
          <ContentCardActions
            contentId={content.id}
            initialLikesCount={content.likes_count}
            initialRepostsCount={content.reposts_count}
            initialCommentsCount={content.comments_count}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </article>
  )
}
