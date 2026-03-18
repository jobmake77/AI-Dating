import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCommunityPostById, getPostComments, getUserPostLikeStatus } from '@/lib/queries/community-posts'
import { getUserMembershipStatus } from '@/lib/queries/communities'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ThumbsUp, MessageCircle, Pin, Lock, Trash, Users } from 'lucide-react'
import { togglePostLike, togglePostPin, togglePostLock, deleteCommunityPost, createPostComment } from '@/lib/actions/community-posts'
import { getRequestLocale } from '@/i18n/request'
import { getTranslation } from '@/i18n/dictionaries'

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
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `communityPost.${key}`, fallback)
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
      <Card className="p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <Image
            src={post.author.avatar_url || '/default-avatar.png'}
            alt={post.author.display_name || post.author.username}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/u/${post.author.username}`} className="font-medium text-sm hover:underline">
                    {post.author.display_name || post.author.username}
                  </Link>
                  {post.is_pinned && (
                    <Pin className="w-3.5 h-3.5 text-primary" />
                  )}
                  {post.is_locked && (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  {canModerate && (
                    <>
                      <form action={handleTogglePin.bind(null, postId)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="submit">
                          <Pin className={`w-3.5 h-3.5 ${post.is_pinned ? 'fill-current' : ''}`} />
                        </Button>
                      </form>
                      <form action={handleToggleLock.bind(null, postId)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="submit">
                          <Lock className={`w-3.5 h-3.5 ${post.is_locked ? 'fill-current' : ''}`} />
                        </Button>
                      </form>
                    </>
                  )}
                  <form action={handleDeletePost.bind(null, postId)}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="submit">
                      <Trash className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {post.title && (
              <h1 className="text-xl font-bold mt-3">{post.title}</h1>
            )}
            <div className="mt-3 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</div>

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                {post.images.map((img: string, idx: number) => (
                  <Image
                    key={idx}
                    src={img}
                    alt=""
                    width={400}
                    height={160}
                    unoptimized
                    className="w-full h-40 rounded object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-5 pt-4 border-t">
              {user && (
                <form action={handleToggleLike.bind(null, postId)}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" type="submit">
                    <ThumbsUp className={`w-3.5 h-3.5 mr-1.5 ${liked ? 'fill-current' : ''}`} />
                    {post.likes_count}
                  </Button>
                </form>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="w-3.5 h-3.5" />
                {post.comments_count} {t('comments', '评论')}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

async function CommentsList({ postId }: { postId: string }) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `communityPost.${key}`, fallback)
  const { data: comments } = await getPostComments(postId)
  type CommunityPostComment = Awaited<ReturnType<typeof getPostComments>>['data'][number]

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t('noComments', '还没有评论')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment: CommunityPostComment) => (
        <Card key={comment.id} className="p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <Image
              src={comment.author.avatar_url || '/default-avatar.png'}
              alt={comment.author.display_name || comment.author.username}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/u/${comment.author.username}`} className="font-medium text-xs hover:underline">
                  {comment.author.display_name || comment.author.username}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
                </span>
              </div>
              <p className="text-sm mt-1 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function CommentForm({ postId }: { postId: string }) {
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `communityPost.${key}`, fallback)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card className="p-4 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">{t('loginToComment', '请先登录后评论')}</p>
      </Card>
    )
  }

  const { data: post } = await getCommunityPostById(postId)
  if (post?.is_locked) {
    return (
      <Card className="p-4 text-center shadow-sm">
        <p className="text-muted-foreground text-sm">{t('locked', '帖子已被锁定，无法评论')}</p>
      </Card>
    )
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const content = formData.get('content') as string
    await createPostComment(postId, content)
  }

  return (
    <Card className="p-4 shadow-sm">
      <form action={handleSubmit} className="space-y-3">
        <Textarea
          name="content"
          placeholder={t('commentPlaceholder', '写下你的评论...')}
          required
          minLength={1}
          maxLength={2000}
          rows={3}
          className="text-sm"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" className="text-xs">{t('submitComment', '发表评论')}</Button>
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
  const locale = await getRequestLocale()
  const t = (key: string, fallback: string) => getTranslation(locale, `communityPost.${key}`, fallback)
  const { data: post } = await getCommunityPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link
          href={`/communities/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('back', '返回社区')}
        </Link>

        {/* Community Info Banner */}
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm mb-4">
          <div className="h-12 bg-gradient-to-r from-primary/20 via-accent/10 to-blue-500/20" />
          <div className="px-4 pb-3 -mt-4">
            <div className="flex items-end gap-2">
              {post.community.icon_url ? (
                <Image
                  src={post.community.icon_url}
                  alt={post.community.name}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-10 h-10 rounded-lg bg-card shadow-sm border border-border object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-card shadow-sm border border-border flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="pb-0.5">
                <Link href={`/communities/${slug}`} className="text-sm font-bold text-foreground hover:underline">
                  {post.community.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {post.community.members_count} {t('members', '成员')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="text-sm text-muted-foreground">{t('loading', '加载中...')}</div>}>
          <PostDetail postId={id} />
        </Suspense>

        <div className="mt-6">
          <h2 className="text-base font-bold mb-3">{t('comments', '评论')}</h2>
          <div className="space-y-3">
            <CommentForm postId={id} />
            <Suspense fallback={<div className="text-sm text-muted-foreground">{t('loading', '加载中...')}</div>}>
              <CommentsList postId={id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
