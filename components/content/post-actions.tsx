'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Repeat2, Share2, Link2, Check } from 'lucide-react'
import { toggleLike } from '@/lib/actions/likes'
import { toggleRepost } from '@/lib/actions/reposts'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isReposted, setIsReposted] = useState(initialIsReposted)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isRepostLoading, setIsRepostLoading] = useState(false)
  const router = useRouter()

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsLikeLoading(true)

    // Optimistic update
    const newIsLiked = !isLiked
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1
    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    try {
      await toggleLike(contentId)
      router.refresh()
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikesCount(likesCount)
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleToggleRepost = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsRepostLoading(true)

    // Optimistic update
    const newIsReposted = !isReposted
    const newRepostsCount = newIsReposted ? repostsCount + 1 : repostsCount - 1
    setIsReposted(newIsReposted)
    setRepostsCount(newRepostsCount)

    try {
      await toggleRepost(contentId)
      toast.success(newIsReposted ? '已转发' : '已取消转发')
      router.refresh()
    } catch (error) {
      // Revert on error
      setIsReposted(!newIsReposted)
      setRepostsCount(repostsCount)
      console.error('Failed to toggle repost:', error)
      toast.error('操作失败')
    } finally {
      setIsRepostLoading(false)
    }
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${contentId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('复制失败')
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${contentId}`

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          url,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  return (
    <div className="flex items-center gap-2 pt-4 border-t">
      {/* Comment Button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={() => {
          // Scroll to comments section
          const commentsSection = document.getElementById('comments-section')
          commentsSection?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="text-sm">{initialCommentsCount}</span>
      </Button>

      {/* Repost Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${
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

      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${
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

      {/* Share Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 className="h-4 w-4 mr-2" />
            复制链接
          </DropdownMenuItem>
          {navigator.share && (
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
