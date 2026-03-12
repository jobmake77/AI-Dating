'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface EventShareButtonProps {
  title: string
  url: string
}

export function EventShareButton({ title, url }: EventShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('链接已复制', { description: '可粘贴到微信等平台分享' })
    } catch {
      toast.error('复制失败，请手动复制链接')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="h-9 text-xs gap-1.5 flex-1"
    >
      <Share2 className="h-3.5 w-3.5" />
      分享
    </Button>
  )
}
