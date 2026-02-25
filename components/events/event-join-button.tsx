'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      setIsLoading(false)
      return
    }

    try {
      if (isJoined) {
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)

        if (error) throw error
        setIsJoined(false)
        setCount(c => Math.max(c - 1, 0))
        toast.success('已取消参与')
      } else {
        const { error } = await supabase
          .from('event_participants')
          .insert({ event_id: eventId, user_id: user.id })

        if (error) throw error
        setIsJoined(true)
        setCount(c => c + 1)
        toast.success('报名成功！')
      }
      router.refresh()
    } catch (error) {
      console.error('参与活动失败:', error)
      toast.error('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isJoined ? 'outline' : 'default'}
      className="gap-2"
    >
      <Users className="h-4 w-4" />
      {isJoined ? `已参与 (${count})` : `我要参与 (${count})`}
    </Button>
  )
}
