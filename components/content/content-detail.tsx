'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/lib/constants/categories'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ContentDetailProps {
  content: {
    id: string
    title: string
    category: string
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
  const category = CATEGORIES[content.category as keyof typeof CATEGORIES]
  const isPaidContent = content.price_type === 'member_only'
  const canViewFullContent = !isPaidContent || isMember

  // Show paywall for paid content if user is not a member
  const displayContent = canViewFullContent
    ? content.content
    : content.content.substring(0, 500) + '...'

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">
            {category?.icon} {category?.name}
          </Badge>
          {isPaidContent && (
            <Badge variant="default">会员专享</Badge>
          )}
          {content.tags && content.tags.length > 0 && (
            <>
              {content.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{content.reading_time} 分钟阅读</span>
          <span>{content.view_count} 浏览</span>
          <time>
            {formatDistanceToNow(new Date(content.created_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </time>
        </div>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {displayContent}
        </ReactMarkdown>
      </div>

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
