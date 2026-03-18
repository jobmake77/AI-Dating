'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'use-intl'

interface EventShareButtonProps {
  title: string
  url: string
}

export function EventShareButton({ title, url }: EventShareButtonProps) {
  const t = useTranslations('eventDetail')
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
      toast.success(t('linkCopied'), { description: t('linkCopiedDescription') })
    } catch {
      toast.error(t('copyFailed'))
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
      {t('share')}
    </Button>
  )
}
