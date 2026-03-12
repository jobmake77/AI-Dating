'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/follows'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  isCurrentUser: boolean
  isAuthenticated: boolean
}

export function FollowButton({
  userId,
  initialIsFollowing,
  isCurrentUser,
  isAuthenticated,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (isCurrentUser) {
    return null
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsLoading(true)

    // Optimistic update
    const newIsFollowing = !isFollowing
    setIsFollowing(newIsFollowing)

    try {
      await toggleFollow(userId)
      toast.success(newIsFollowing ? '已关注' : '已取消关注')
      router.refresh()
    } catch (error) {
      // Revert on error
      setIsFollowing(!newIsFollowing)
      console.error('Failed to toggle follow:', error)
      toast.error('操作失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={isFollowing
        ? 'w-full h-8 text-xs border-primary/30 text-primary hover:bg-primary/10'
        : 'w-full h-8 text-xs gradient-primary text-white hover:opacity-90 shadow-primary'
      }
    >
      {isFollowing ? '已关注' : '关注'}
    </Button>
  )
}
