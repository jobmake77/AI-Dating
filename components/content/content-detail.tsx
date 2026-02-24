'use client'

import DOMPurify from 'dompurify'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TagList } from '@/components/tag/tag-list'
import { PostActions } from '@/components/content/post-actions'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, Clock } from 'lucide-react'
import { deleteContent } from '@/lib/actions/content'

interface ContentDetailProps {
  content: {
    id: string
    title: string
    content: string
    price_type: string
    reading_time: number
    view_count: number
    likes_count: number
    reposts_count: number
    comments_count: number
    created_at: string
    tags: string[] | null
  }
  isAuthenticated: boolean
  isMember: boolean
  isAuthor?: boolean
  isLiked: boolean
  isReposted: boolean
  contentId: string
}

export function ContentDetail({ content, isAuthenticated, isMember, isAuthor, isLiked, isReposted, contentId }: ContentDetailProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const isPaidContent = content.price_type === 'member'
  const canViewFullContent = !isPaidContent || isMember

  // Sanitize HTML content on client side
  useEffect(() => {
    const displayContent = canViewFullContent
      ? content.content
      : content.content.substring(0, 500) + '...'

    // Configure DOMPurify to allow images and common HTML tags
    const clean = DOMPurify.sanitize(displayContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'code', 'pre', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'width', 'height', 'class', 'style', 'target', 'rel'],
    })
    setSanitizedContent(clean)
  }, [content.content, canViewFullContent])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteContent(contentId)
    } catch (error) {
      console.error('Failed to delete content:', error)
      setIsDeleting(false)
    }
  }

  return (
    <article className="border-b border-border/50">
      {/* Header */}
      <header className="px-4 py-6 space-y-4">
        {/* Meta Info and Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{content.reading_time} 分钟阅读</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{content.view_count} 浏览</span>
            </div>
            <span>·</span>
            <time>
              {formatDistanceToNow(new Date(content.created_at), {
                addSuffix: true,
                locale: zhCN,
              })}
            </time>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/edit/${contentId}`}>
                  <Edit className="h-4 w-4 mr-1.5" />
                  编辑
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作无法撤销。确定要删除这篇内容吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? '删除中...' : '确认删除'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{content.title}</h1>

        {/* Tags and Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          {isPaidContent && (
            <Badge variant="default" className="shrink-0">会员专享</Badge>
          )}
          {content.tags && content.tags.length > 0 && (
            <TagList tags={content.tags} />
          )}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {isPaidContent && !canViewFullContent && (
          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent h-32 -mt-32" />
            </div>
            <Alert className="border-primary">
              <AlertDescription>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold mb-1">🔒 会员专享内容</p>
                    <p className="text-sm text-muted-foreground">
                      升级会员即可查看完整内容，解锁更多优质资源
                    </p>
                  </div>
                  <Button asChild size="lg">
                    <Link href="/pricing">查看会员权益</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-4 border-t border-border/50">
        <PostActions
          contentId={contentId}
          initialLikesCount={content.likes_count}
          initialRepostsCount={content.reposts_count}
          initialCommentsCount={content.comments_count}
          initialIsLiked={isLiked}
          initialIsReposted={isReposted}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </article>
  )
}
