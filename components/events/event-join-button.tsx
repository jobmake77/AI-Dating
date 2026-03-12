'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { joinEvent, leaveEvent } from '@/lib/actions/events'

interface EventJoinButtonProps {
  eventId: string
  initialJoined: boolean
  initialCount: number
  isAuthenticated: boolean
}

export function EventJoinButton({
  eventId,
  initialJoined,
  initialCount,
  isAuthenticated,
}: EventJoinButtonProps) {
  const [isJoined, setIsJoined] = useState(initialJoined)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const result = isJoined
        ? await leaveEvent(eventId)
        : await joinEvent(eventId)

      if (!result.success) {
        toast.error(result.error || '操作失败，请重试')
        return
      }

      if (isJoined) {
        setIsJoined(false)
        setCount((c) => Math.max(c - 1, 0))
        toast.success('已取消参与')
      } else {
        setIsJoined(true)
        setCount((c) => c + 1)
        toast.success('报名成功！')
      }
    } catch {
      toast.error('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      size="sm"
      className={`h-9 text-xs gap-1.5 flex-1 ${
        isJoined
          ? 'bg-secondary text-foreground hover:bg-secondary/80'
          : 'gradient-primary text-white hover:opacity-90 shadow-primary'
      }`}
    >
      <Users className="h-3.5 w-3.5" />
      {isJoined ? '已参加' : '报名参加'}
    </Button>
  )
}
