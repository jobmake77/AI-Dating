'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Repeat2, Share2, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

interface PostActionsProps {
  contentId: string
  initialLikesCount: number
  initialRepostsCount: number
  initialCommentsCount: number
  initialIsLiked: boolean
  initialIsReposted: boolean
  isAuthenticated: boolean
}

export function PostActions({
  contentId,
  initialLikesCount,
  initialRepostsCount,
  initialCommentsCount,
  initialIsLiked,
  initialIsReposted,
  isAuthenticated,
}: PostActionsProps) {
  const t = useTranslations('contentUi')
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isReposted, setIsReposted] = useState(initialIsReposted)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isRepostLoading, setIsRepostLoading] = useState(false)
  const router = useRouter()

  const handleToggleLike = async () => {
    if (!isAuthenticated) { router.push('/login'); return }

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

  const handleToggleRepost = async () => {
    if (!isAuthenticated) { router.push('/login'); return }

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
      toast.success(newIsReposted ? t('reposted') : t('repostCancelled'))
      router.refresh()
    } catch (error) {
      setIsReposted(!newIsReposted)
      setRepostsCount(initialRepostsCount)
      console.error('Failed to toggle repost:', error)
      toast.error(t('actionFailed'))
    } finally {
      setIsRepostLoading(false)
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${contentId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('linkCopied'))
    } catch {
      toast.error(t('copyFailed'))
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${contentId}`
    if (navigator.share) {
      try { await navigator.share({ url }) } catch { /* cancelled */ }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="flex items-center gap-2 pt-4 border-t">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm">{initialCommentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${isReposted ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950' : 'text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950'}`}
        onClick={handleToggleRepost}
        disabled={isRepostLoading}
      >
        <Repeat2 className="h-4 w-4" />
        <span className="text-sm">{repostsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${isLiked ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950' : 'text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'}`}
        onClick={handleToggleLike}
        disabled={isLikeLoading}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="text-sm">{likesCount}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 className="h-4 w-4 mr-2" />
            {t('copyLink')}
          </DropdownMenuItem>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('share')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
