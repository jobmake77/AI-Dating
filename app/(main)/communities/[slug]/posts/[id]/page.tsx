import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityPostById, getPostComments, getUserPostLikeStatus } from '@/lib/queries/community-posts'
import { getUserMembershipStatus } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ArrowLeft, ThumbsUp, MessageCircle, Pin, Lock, Trash } from 'lucide-react'
import { togglePostLike, togglePostPin, togglePostLock, deleteCommunityPost, createPostComment } from '@/lib/actions/community-posts'

async function handleToggleLike(postId: string): Promise<void> {
  'use server'
  await togglePostLike(postId)
}

async function handleTogglePin(postId: string): Promise<void> {
  'use server'
  await togglePostPin(postId)
}

async function handleToggleLock(postId: string): Promise<void> {
  'use server'
  await togglePostLock(postId)
}

async function handleDeletePost(postId: string): Promise<void> {
  'use server'
  await deleteCommunityPost(postId)
}

async function PostDetail({ postId }: { postId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await getCommunityPostById(postId)
  if (!post) return null

  let membership = null
  let liked = false

  if (user) {
    const { data: memberData } = await getUserMembershipStatus(post.community.id, user.id)
    membership = memberData

    const { liked: isLiked } = await getUserPostLikeStatus(postId, user.id)
    liked = isLiked
  }

  const isAuthor = user?.id === post.author_id
  const canModerate = membership && ['admin', 'moderator'].includes(membership.role)
  const canEdit = isAuthor || canModerate

  return (
    <div>
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={post.author.avatar_url || '/default-avatar.png'}
            alt={post.author.display_name || post.author.username}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/u/${post.author.username}`} className="font-medium hover:underline">
                  {post.author.display_name || post.author.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  {canModerate && (
                    <>
                      <form action={handleTogglePin.bind(null, postId)}>
                        <Button variant="ghost" size="sm" type="submit">
                          <Pin className={`w-4 h-4 ${post.is_pinned ? 'fill-current' : ''}`} />
                        </Button>
                      </form>
                      <form action={handleToggleLock.bind(null, postId)}>
                        <Button variant="ghost" size="sm" type="submit">
                          <Lock className={`w-4 h-4 ${post.is_locked ? 'fill-current' : ''}`} />
                        </Button>
                      </form>
                    </>
                  )}
                  <form action={handleDeletePost.bind(null, postId)}>
                    <Button variant="ghost" size="sm" type="submit">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {post.title && (
              <h1 className="text-2xl font-bold mt-4">{post.title}</h1>
            )}
            <div className="mt-4 whitespace-pre-wrap">{post.content}</div>

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                {post.images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className="w-full h-48 rounded object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
              {user && (
                <form action={handleToggleLike.bind(null, postId)}>
                  <Button variant="ghost" size="sm" type="submit">
                    <ThumbsUp className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </Button>
                </form>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                {post.comments_count} 评论
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

async function CommentsList({ postId }: { postId: string }) {
  const { data: comments } = await getPostComments(postId)

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        还没有评论
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: any) => (
        <Card key={comment.id} className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={comment.author.avatar_url || '/default-avatar.png'}
              alt={comment.author.display_name || comment.author.username}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/u/${comment.author.username}`} className="font-medium text-sm hover:underline">
                  {comment.author.display_name || comment.author.username}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString('zh-CN')}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function CommentForm({ postId }: { postId: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">请先登录后评论</p>
      </Card>
    )
  }

  const { data: post } = await getCommunityPostById(postId)
  if (post?.is_locked) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">帖子已被锁定，无法评论</p>
      </Card>
    )
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const content = formData.get('content') as string
    await createPostComment(postId, content)
  }

  return (
    <Card className="p-4">
      <form action={handleSubmit} className="space-y-4">
        <Textarea
          name="content"
          placeholder="写下你的评论..."
          required
          minLength={1}
          maxLength={2000}
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit">发表评论</Button>
        </div>
      </form>
    </Card>
  )
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const { data: post } = await getCommunityPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-8">
      <Link href={`/communities/${slug}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回社区
        </Button>
      </Link>

      <Suspense fallback={<div>加载中...</div>}>
        <PostDetail postId={id} />
      </Suspense>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">评论</h2>
        <div className="space-y-4">
          <CommentForm postId={id} />
          <Suspense fallback={<div>加载中...</div>}>
            <CommentsList postId={id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
