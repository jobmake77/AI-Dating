'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { createConversationWithUser } from '@/lib/actions/chat'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'use-intl'

interface SendMessageButtonProps {
  userId: string
  isAuthenticated: boolean
}

export function SendMessageButton({ userId, isAuthenticated }: SendMessageButtonProps) {
  const t = useTranslations('userActions')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsCreating(true)
    const result = await createConversationWithUser(userId)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: t('actionFailed'),
        description: result.error,
      })
      setIsCreating(false)
      return
    }

    // 跳转到会话页面
    router.push(`/messages/${result.conversationId}`)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSendMessage}
      disabled={isCreating}
      className="shadow-sm hover:shadow-md transition-shadow"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {isCreating ? t('creatingConversation') : t('sendMessage')}
    </Button>
  )
}
