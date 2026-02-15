'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { deleteComment } from '@/lib/actions/comments'
import { useRouter } from 'next/navigation'
import type { Comment } from '@/lib/queries/comments'

interface CommentListProps {
  comments: Comment[]
  currentUserId?: string
  contentId: string
}

export function CommentList({ comments, currentUserId, contentId }: CommentListProps) {
  const router = useRouter()

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>还没有评论，来发表第一条评论吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={currentUserId === comment.user_id}
          contentId={contentId}
          onDelete={() => router.refresh()}
        />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  isOwner: boolean
  contentId: string
  onDelete: () => void
}

function CommentItem({ comment, isOwner, contentId, onDelete }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteComment(comment.id, contentId)
      onDelete()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.user.avatar || undefined} />
        <AvatarFallback>
          {comment.user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.user.username}</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除这条评论吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? '删除中...' : '确认删除'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  )
}
