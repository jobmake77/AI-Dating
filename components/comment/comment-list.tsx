'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, MessageCircle } from 'lucide-react'
import { deleteComment, createComment } from '@/lib/actions/comments'
import { useRouter } from 'next/navigation'
import type { Comment } from '@/lib/queries/comments'
import { useLocale, useTranslations } from 'use-intl'

function formatTime(dateStr: string, locale: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 3600000
  if (diff < 24) return `${Math.max(1, Math.floor(diff))}h${locale === 'en' ? ' ago' : '前'}`
  const d = new Date(dateStr)
  return locale === 'en' ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getMonth() + 1}月${d.getDate()}日`
}

interface CommentListProps {
  comments: Comment[]
  currentUserId?: string
  contentId: string
  isAuthenticated: boolean
}

export function CommentList({ comments, currentUserId, contentId, isAuthenticated }: CommentListProps) {
  const t = useTranslations('commentUi')
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={currentUserId === comment.user_id}
          contentId={contentId}
          currentUserId={currentUserId}
          isAuthenticated={isAuthenticated}
          depth={0}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  isOwner: boolean
  contentId: string
  currentUserId?: string
  isAuthenticated: boolean
  depth: number
}

function CommentItem({ comment, isOwner, contentId, currentUserId, isAuthenticated, depth }: CommentItemProps) {
  const t = useTranslations('commentUi')
  const locale = useLocale()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteComment(comment.id, contentId)
      router.refresh()
    } catch {
      setIsDeleting(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    setIsReplying(true)
    setReplyError('')
    try {
      await createComment(contentId, replyText, comment.id)
      setReplyText('')
      setShowReply(false)
      router.refresh()
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : t('replyFailed'))
    } finally {
      setIsReplying(false)
    }
  }

  return (
    <div className={`py-4 ${depth > 0 ? 'pl-10 border-l-2 border-border/40 ml-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user?.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {comment.user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">{comment.user?.username}</span>
            <span className="text-xs text-muted-foreground">{formatTime(comment.created_at, locale)}</span>
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-auto" disabled={isDeleting}>
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? t('deleting') : t('confirmDelete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>

          {isAuthenticated && depth === 0 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {showReply ? t('collapse') : `${t('reply')}${comment.replies && comment.replies.length > 0 ? ` (${comment.replies.length})` : ''}`}
            </button>
          )}

          {showReply && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('replyPlaceholder', { username: comment.user?.username || '' })}
                className="min-h-[72px] text-sm"
                disabled={isReplying}
              />
              {replyError && <p className="text-xs text-destructive">{replyError}</p>}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setShowReply(false); setReplyText('') }}>
                  {t('cancel')}
                </Button>
                <Button size="sm" onClick={handleReply} disabled={isReplying || !replyText.trim()}>
                  {isReplying ? t('replying') : t('reply')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-11 space-y-0 divide-y divide-border/30 border-l-2 border-border/30 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isOwner={currentUserId === reply.user_id}
              contentId={contentId}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
