'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment } from '@/lib/actions/comments'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'use-intl'

interface CommentFormProps {
  contentId: string
  isAuthenticated: boolean
}

export function CommentForm({ contentId, isAuthenticated }: CommentFormProps) {
  const t = useTranslations('comments')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('loginRequired')}</p>
        <Button className="mt-4" onClick={() => router.push('/login')}>
          {t('login')}
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError(t('empty'))
      return
    }

    if (content.length > 1000) {
      setError(t('tooLong'))
      return
    }

    setIsSubmitting(true)
    try {
      await createComment(contentId, content)
      setContent('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('placeholder')}
        className="min-h-[100px]"
        disabled={isSubmitting}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {content.length} / 1000
        </span>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
