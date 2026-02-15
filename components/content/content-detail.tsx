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
import { Edit, Trash2 } from 'lucide-react'
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
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'img', 'a', 'code', 'pre', 'blockquote', 'div'],
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
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {isPaidContent && (
              <Badge variant="default">会员专享</Badge>
            )}
          </div>
          {isAuthor && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/edit/${contentId}`}>
                  <Edit className="h-4 w-4 mr-1.5" />
                  编辑
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isDeleting}>
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

        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span>{content.reading_time} 分钟阅读</span>
          <span>{content.view_count} 浏览</span>
          <time>
            {formatDistanceToNow(new Date(content.created_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </time>
        </div>

        {content.tags && content.tags.length > 0 && (
          <TagList tags={content.tags} />
        )}
      </header>

      <div
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <PostActions
        contentId={contentId}
        initialLikesCount={content.likes_count}
        initialRepostsCount={content.reposts_count}
        initialCommentsCount={content.comments_count}
        initialIsLiked={isLiked}
        initialIsReposted={isReposted}
        isAuthenticated={isAuthenticated}
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
    </article>
  )
}
