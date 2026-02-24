'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ContentCardActionsProps {
  contentId: string
  initialLikesCount: number
  initialRepostsCount: number
  initialCommentsCount: number
  isAuthenticated: boolean
}

export function ContentCardActions({
  contentId,
  initialLikesCount,
  initialRepostsCount,
  initialCommentsCount,
  isAuthenticated,
}: ContentCardActionsProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount)
  const [isLiked, setIsLiked] = useState(false)
  const [isReposted, setIsReposted] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isRepostLoading, setIsRepostLoading] = useState(false)
  const router = useRouter()

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsLikeLoading(true)
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      if (newIsLiked) {
        await supabase.from('likes').insert({ content_id: contentId, user_id: user.id })
      } else {
        await supabase.from('likes').delete().eq('content_id', contentId).eq('user_id', user.id)
      }
      router.refresh()
    } catch (error) {
      setIsLiked(!newIsLiked)
      setLikesCount(initialLikesCount)
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleToggleRepost = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsRepostLoading(true)
    const newIsReposted = !isReposted
    setIsReposted(newIsReposted)
    setRepostsCount(newIsReposted ? repostsCount + 1 : repostsCount - 1)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      if (newIsReposted) {
        await supabase.from('reposts').insert({ content_id: contentId, user_id: user.id })
      } else {
        await supabase.from('reposts').delete().eq('content_id', contentId).eq('user_id', user.id)
      }
      toast.success(newIsReposted ? '已转发' : '已取消转发')
      router.refresh()
    } catch (error) {
      setIsReposted(!newIsReposted)
      setRepostsCount(initialRepostsCount)
      console.error('Failed to toggle repost:', error)
      toast.error('操作失败')
    } finally {
      setIsRepostLoading(false)
    }
  }

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/post/${contentId}#comments-section`)
  }

  return (
    <div className="flex items-center gap-1 -ml-2">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 h-8 px-2"
        onClick={handleComment}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">{initialCommentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`gap-1.5 h-8 px-2 ${
          isReposted
            ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950'
            : 'text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
        }`}
        onClick={handleToggleRepost}
        disabled={isRepostLoading}
      >
        <Repeat2 className="h-4 w-4" />
        <span className="text-sm">{repostsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`gap-1.5 h-8 px-2 ${
          isLiked
            ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
            : 'text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
        }`}
        onClick={handleToggleLike}
        disabled={isLikeLoading}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm">{likesCount}</span>
      </Button>
    </div>
  )
}
