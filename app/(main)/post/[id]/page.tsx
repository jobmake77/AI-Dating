import { getContentById } from '@/lib/queries/content'
import { getCommentsByContentId } from '@/lib/queries/comments'
import { checkUserLiked } from '@/lib/actions/likes'
import { checkUserReposted } from '@/lib/actions/reposts'
import { checkUserMembership } from '@/lib/actions/membership'
import { createClient } from '@/lib/supabase/server'
import { incrementViewCount } from '@/lib/actions/content'
import { ContentDetail } from '@/components/content/content-detail'
import { AuthorCard } from '@/components/content/author-card'
import { CommentForm } from '@/components/comment/comment-form'
import { CommentList } from '@/components/comment/comment-list'
import { Paywall } from '@/components/membership/paywall'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Clock, XCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface PostPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pending?: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const content = await getContentById(id)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
            ]
          : [
              {
                url: '/og-image.png',
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
        images: content.cover_image ? [content.cover_image] : ['/og-image.png'],
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

    let isMember = false
    if (user) {
      isMember = await checkUserMembership(user.id)
    }

    // 检查是否需要显示付费墙
    const needsPaywall = content.price_type === 'member' && !isMember && user?.id !== content.author_id

    // Fetch comments
    const comments = await getCommentsByContentId(id)

    // Check if user liked and reposted this content
    let isLiked = false
    let isReposted = false
    if (user) {
      isLiked = await checkUserLiked(id, user.id)
      isReposted = await checkUserReposted(id, user.id)
    }

    // Increment view count asynchronously (don't await)
    incrementViewCount(id).catch(console.error)

    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-[1280px] mx-auto px-4 py-4">
          {/* 待审核提示 */}
          {content.status === 'pending' && (
            <Alert className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertTitle>内容待审核</AlertTitle>
              <AlertDescription>
                你的内容已提交，正在等待管理员审核。审核通过后将自动发布。
              </AlertDescription>
            </Alert>
          )}

          {/* 拒绝提示 */}
          {content.status === 'rejected' && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>内容未通过审核</AlertTitle>
              <AlertDescription>
                {content.reject_reason || '你的内容未通过审核，请修改后重新提交。'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Author Card */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-[72px]">
                <AuthorCard author={content.users} />
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <ContentDetail
                content={content}
                isAuthenticated={!!user}
                isMember={isMember}
                isAuthor={user?.id === content.author_id}
                isLiked={isLiked}
                isReposted={isReposted}
                contentId={id}
              />

              {/* 付费墙 */}
              {needsPaywall && (
                <div className="mt-8">
                  <Paywall contentType="article" />
                </div>
              )}

              {/* Comments Section - 只有非付费墙内容才显示评论 */}
              {!needsPaywall && (
                <div id="comments-section" className="border-t border-border/50 px-4 py-6">
                  <h2 className="text-xl font-bold mb-6">
                    评论 ({content.comments_count || 0})
                  </h2>
                  <div className="space-y-6">
                    <CommentForm
                      contentId={id}
                      isAuthenticated={!!user}
                    />
                    <CommentList
                      comments={comments}
                      currentUserId={user?.id}
                      contentId={id}
                    />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
