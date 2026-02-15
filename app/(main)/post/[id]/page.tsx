import { getContentById } from '@/lib/queries/content'
import { getCommentsByContentId } from '@/lib/queries/comments'
import { checkUserLiked } from '@/lib/actions/likes'
import { checkUserReposted } from '@/lib/actions/reposts'
import { createClient } from '@/lib/supabase/server'
import { incrementViewCount } from '@/lib/actions/content'
import { ContentDetail } from '@/components/content/content-detail'
import { AuthorCard } from '@/components/content/author-card'
import { CommentForm } from '@/components/comment/comment-form'
import { CommentList } from '@/components/comment/comment-list'
import { Separator } from '@/components/ui/separator'
import { notFound } from 'next/navigation'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params

  try {
    const content = await getContentById(id)

    // Check authentication and membership status
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isMember = false
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('membership_tier')
        .eq('id', user.id)
        .single()

      isMember = profile?.membership_tier === 'premium'
    }

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
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-8">
            <ContentDetail
              content={content}
              isAuthenticated={!!user}
              isMember={isMember}
              isAuthor={user?.id === content.author_id}
              isLiked={isLiked}
              isReposted={isReposted}
              contentId={id}
            />

            {/* Comments Section */}
            <div id="comments-section" className="space-y-6">
              <Separator />
              <div>
                <h2 className="text-2xl font-bold mb-6">
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
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-6">
            <AuthorCard author={content.users} />
          </aside>

          {/* Right Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
