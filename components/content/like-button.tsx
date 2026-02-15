'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/lib/actions/likes'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  contentId: string
  initialLikesCount: number
  initialIsLiked: boolean
  isAuthenticated: boolean
}

export function LikeButton({
  contentId,
  initialLikesCount,
  initialIsLiked,
  isAuthenticated,
}: LikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsLoading(true)

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
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggleLike}
      disabled={isLoading}
      className="gap-2"
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
      />
      <span>{likesCount}</span>
    </Button>
  )
}
