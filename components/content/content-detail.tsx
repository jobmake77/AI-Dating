'use client'

import DOMPurify from 'dompurify'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TagList } from '@/components/tag/tag-list'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useEffect, useState } from 'react'

interface ContentDetailProps {
  content: {
    id: string
    title: string
    content: string
    price_type: string
    reading_time: number
    view_count: number
    created_at: string
    tags: string[] | null
  }
  isAuthenticated: boolean
  isMember: boolean
}

export function ContentDetail({ content, isAuthenticated, isMember }: ContentDetailProps) {
  const [sanitizedContent, setSanitizedContent] = useState('')
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

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {isPaidContent && (
            <Badge variant="default">会员专享</Badge>
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

      {isPaidContent && !canViewFullContent && (
        <Alert className="mt-8">
          <AlertDescription className="flex items-center justify-between">
            <span>此内容为会员专享，升级会员以查看完整内容</span>
            <Button asChild>
              <a href="/pricing">升级会员</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </article>
  )
}
