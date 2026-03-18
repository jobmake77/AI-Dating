'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { joinEvent, leaveEvent } from '@/lib/actions/events'
import { useTranslations } from 'use-intl'

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
  const t = useTranslations('eventDetail')
  const [isJoined, setIsJoined] = useState(initialJoined)
  const [, setCount] = useState(initialCount)
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
        toast.error(result.error || t('actionFailed'))
        return
      }

      if (isJoined) {
        setIsJoined(false)
        setCount((c) => Math.max(c - 1, 0))
        toast.success(t('left'))
      } else {
        setIsJoined(true)
        setCount((c) => c + 1)
        toast.success(t('joined'))
      }
    } catch {
      toast.error(t('actionFailed'))
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
      {isJoined ? t('joinedState') : t('joinAction')}
    </Button>
  )
}
