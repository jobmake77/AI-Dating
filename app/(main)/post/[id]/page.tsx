import { getContentById } from '@/lib/queries/content'
import { getCommentsByContentId } from '@/lib/queries/comments'
import { checkUserLiked } from '@/lib/actions/likes'
import { checkUserReposted } from '@/lib/actions/reposts'
import { checkUserBookmarked } from '@/lib/actions/bookmarks'
import { createClient } from '@/lib/supabase/server'
import { incrementViewCount } from '@/lib/actions/content'
import { ContentDetailCard } from '@/components/content/content-detail-card'
import { CompactPostActions } from '@/components/content/compact-post-actions'
import { CompactCommentForm } from '@/components/comment/compact-comment-form'
import { CompactCommentList } from '@/components/comment/compact-comment-list'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Clock, XCircle, ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/seo/structured-data'

interface PostPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pending?: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const content = await getContentById(id)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const ogImageUrl = `${baseUrl}/api/og?type=post&title=${encodeURIComponent(content.title)}&author=${encodeURIComponent(content.users.full_name || content.users.username)}&tags=${encodeURIComponent((content.tags || []).join(','))}`

    return {
      title: content.title,
      description: content.excerpt || content.title,
      keywords: content.tags || [],
      authors: [{ name: content.users.full_name || content.users.username }],
      openGraph: {
        type: 'article',
        locale: 'zh_CN',
        url: `${baseUrl}/post/${content.id}`,
        title: content.title,
        description: content.excerpt || content.title,
        siteName: 'AI-Dating',
        images: content.cover_image
          ? [
              {
                url: content.cover_image,
                width: 1200,
                height: 630,
                alt: content.title,
              },
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: content.title,
              },
            ]
          : [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: content.title,
              },
            ],
        publishedTime: content.created_at,
        modifiedTime: content.updated_at,
        authors: [content.users.full_name || content.users.username],
        tags: content.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: content.title,
        description: content.excerpt || content.title,
        images: content.cover_image ? [content.cover_image] : [ogImageUrl],
        creator: `@${content.users.username}`,
      },
    }
  } catch (error) {
    return {
      title: '内容未找到',
      description: '该内容不存在或已被删除',
    }
  }
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { id } = await params
  const { pending } = await searchParams

  try {
    const content = await getContentById(id)

    // Check authentication and membership status
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch comments
    const comments = await getCommentsByContentId(id)

    // Check if user liked and reposted this content
    let isLiked = false
    let isReposted = false
    let isBookmarked = false
    if (user) {
      isLiked = await checkUserLiked(id, user.id)
      isReposted = await checkUserReposted(id, user.id)
      isBookmarked = await checkUserBookmarked(id, user.id)
    }

    // Increment view count asynchronously (don't await)
    incrementViewCount(id).catch(console.error)

    // Generate structured data
    const articleSchema = getArticleSchema({
      title: content.title,
      description: content.excerpt || content.title,
      author: content.users.full_name || content.users.username,
      publishedTime: content.created_at,
      modifiedTime: content.updated_at,
      image: content.cover_image,
      tags: content.tags,
    })

    const breadcrumbSchema = getBreadcrumbSchema([
      { name: '首页', url: '/' },
      { name: '内容', url: '/contents' },
      { name: content.title, url: `/post/${content.id}` },
    ])

    return (
      <div className="min-h-screen bg-background">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <div className="mx-auto max-w-3xl px-4 py-4">
          {/* Back to home link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回首页
          </Link>

          {/* 待审核提示 */}
          {content.status === 'pending' && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertTitle>内容待审核</AlertTitle>
              <AlertDescription>你的内容已提交，正在等待管理员审核。审核通过后将自动发布。</AlertDescription>
            </Alert>
          )}

          {/* 拒绝提示 */}
          {content.status === 'rejected' && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>内容未通过审核</AlertTitle>
              <AlertDescription>{content.reject_reason || '你的内容未通过审核，请修改后重新提交。'}</AlertDescription>
            </Alert>
          )}

          {/* Content Detail Card */}
          <ContentDetailCard
            content={content}
            canViewFullContent
            currentUserId={user?.id}
          />

          {/* Actions */}
          <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card">
            <CompactPostActions
              contentId={id}
              initialLikesCount={content.likes_count}
              initialRepostsCount={content.reposts_count}
              initialIsLiked={isLiked}
              initialIsReposted={isReposted}
              initialIsBookmarked={isBookmarked}
              isAuthenticated={!!user}
            />
          </div>

          {/* Comment Input */}
          <div className="mt-4">
            <CompactCommentForm contentId={id} isAuthenticated={!!user} />
          </div>

          {/* Comments */}
          <div id="comments-section" className="mt-4">
            <CompactCommentList
              comments={comments}
              currentUserId={user?.id}
              contentId={id}
              isAuthenticated={!!user}
              commentsCount={content.comments_count || 0}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
