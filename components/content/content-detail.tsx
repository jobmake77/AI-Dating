'use client'

import DOMPurify from 'dompurify'
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
import { formatISODate } from '@/lib/utils/date'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, Clock } from 'lucide-react'
import { deleteContent } from '@/lib/actions/content'
import { useTranslations } from 'use-intl'

function sanitizeHtml(content: string) {
  const sanitizer = (
    DOMPurify as unknown as {
      sanitize?: (value: string, config?: Record<string, unknown>) => string
      default?: {
        sanitize?: (value: string, config?: Record<string, unknown>) => string
      }
    }
  )

  const sanitize = sanitizer.sanitize ?? sanitizer.default?.sanitize

  if (!sanitize) {
    return content
  }

  return sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'code', 'pre', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'width', 'height', 'class', 'style', 'target', 'rel'],
  })
}

interface ContentDetailProps {
  content: {
    id: string
    title: string
    content: string
    reading_time: number
    view_count: number
    likes_count: number
    reposts_count: number
    comments_count: number
    created_at: string
    tags: string[] | null
  }
  isAuthenticated: boolean
  isAuthor?: boolean
  isLiked: boolean
  isReposted: boolean
  contentId: string
}

export function ContentDetail({ content, isAuthenticated, isAuthor, isLiked, isReposted, contentId }: ContentDetailProps) {
  const t = useTranslations('contentUi')
  const [isDeleting, setIsDeleting] = useState(false)
  const sanitizedContent = useMemo(
    () => sanitizeHtml(content.content),
    [content.content]
  )
  const createdDate = formatISODate(content.created_at)

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
              <span>{content.reading_time} {t('minutesRead')}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{content.view_count} {t('views')}</span>
            </div>
            <span>·</span>
            <time dateTime={content.created_at}>{createdDate}</time>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/edit/${contentId}`}>
                  <Edit className="h-4 w-4 mr-1.5" />
                  {t('edit')}
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    {t('delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('confirmDeleteDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? t('deleting') : t('confirmDelete')}
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
        {content.tags && content.tags.length > 0 && (
          <TagList tags={content.tags} />
        )}
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
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
