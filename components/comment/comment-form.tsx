'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment } from '@/lib/actions/comments'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  contentId: string
  isAuthenticated: boolean
}

export function CommentForm({ contentId, isAuthenticated }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>登录后才能发表评论</p>
        <Button className="mt-4" onClick={() => router.push('/login')}>
          登录
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('评论内容不能为空')
      return
    }

    if (content.length > 1000) {
      setError('评论内容不能超过 1000 字符')
      return
    }

    setIsSubmitting(true)
    try {
      await createComment(contentId, content)
      setContent('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '发表评论失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
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
          {isSubmitting ? '发表中...' : '发表评论'}
        </Button>
      </div>
    </form>
  )
}
