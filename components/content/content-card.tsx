import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TagList } from '@/components/tag/tag-list'
import { Heart, Repeat2, MessageCircle, Clock } from 'lucide-react'
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
    <article className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
      <div className="px-4 py-4">
        {/* 转发信息 */}
        {content.is_repost && content.reposted_by && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 ml-12">
            <Repeat2 className="h-3.5 w-3.5" />
            <Link
              href={`/u/${content.reposted_by.username}`}
              className="hover:underline font-medium"
            >
              {content.reposted_by.full_name || content.reposted_by.username}
            </Link>
            <span>转发了</span>
          </div>
        )}

        <div className="flex gap-3">
          {/* 头像 */}
          <Link href={`/u/${content.users.username}`} className="shrink-0">
            <Avatar className="h-10 w-10 hover:opacity-90 transition-opacity">
              <AvatarImage src={content.users.avatar || undefined} />
              <AvatarFallback className="text-sm">
                {(content.users.full_name || content.users.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 作者信息和时间 */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link
                href={`/u/${content.users.username}`}
                className="font-semibold hover:underline text-sm"
              >
                {content.users.full_name || content.users.username}
              </Link>
              <Link
                href={`/u/${content.users.username}`}
                className="text-muted-foreground text-sm hover:underline"
              >
                @{content.users.username}
              </Link>
              <span className="text-muted-foreground text-sm">·</span>
              <Link
                href={`/post/${content.id}`}
                className="text-muted-foreground text-sm hover:underline"
              >
                {formatDistanceToNow(new Date(displayTime), { addSuffix: true, locale: zhCN })}
              </Link>
            </div>

            {/* 标题 */}
            <Link href={`/post/${content.id}`} className="block mb-2">
              <h3 className="font-bold text-base leading-snug hover:underline line-clamp-2">
                {content.title}
              </h3>
            </Link>

            {/* 摘要 */}
            <Link href={`/post/${content.id}`} className="block mb-3">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {content.excerpt}
              </p>
            </Link>

            {/* 标签 */}
            {content.tags && content.tags.length > 0 && (
              <div className="mb-3">
                <TagList tags={content.tags} />
              </div>
            )}

            {/* 互动统计 */}
            <div className="flex items-center justify-between max-w-md">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{content.comments_count}</span>
              </button>

              <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                  <Repeat2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{content.reposts_count}</span>
              </button>

              <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{content.likes_count}</span>
              </button>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{content.reading_time}分钟</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
