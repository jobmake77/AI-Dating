'use client'

import { useState } from 'react'
import { approveContent, rejectContent } from '@/lib/actions/moderation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Eye, User, Calendar } from 'lucide-react'
import { formatISODate } from '@/lib/utils/date'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Content {
  id: string
  title: string
  excerpt: string
  content: string
  price_type: string
  created_at: string
  users: {
    username: string
    avatar: string | null
    full_name: string | null
  }
}

interface ModerationListProps {
  contents: Content[]
}

export function ModerationList({ contents }: ModerationListProps) {
  const { toast } = useToast()
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async (contentId: string) => {
    try {
      setIsSubmitting(true)
      await approveContent(contentId)
      toast({
        title: '批准成功',
        description: '内容已发布',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '批准失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectClick = (contentId: string) => {
    setSelectedContentId(contentId)
    setIsRejectDialogOpen(true)
  }

  const handleRejectSubmit = async () => {
    if (!selectedContentId || !rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: '请输入拒绝原因',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await rejectContent(selectedContentId, rejectReason)
      toast({
        title: '拒绝成功',
        description: '已通知作者',
      })
      setIsRejectDialogOpen(false)
      setRejectReason('')
      setSelectedContentId(null)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '拒绝失败',
        description: error instanceof Error ? error.message : '请稍后重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (contents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无待审核内容</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {contents.map((content) => (
          <div
            key={content.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* 作者信息 */}
                <div className="flex items-center gap-2 mb-2">
                  {content.users.avatar ? (
                    <Image
                      src={content.users.avatar}
                      alt={content.users.username}
                      width={24}
                      height={24}
                      unoptimized
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {content.users.full_name || content.users.username}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    @{content.users.username}
                  </span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <time dateTime={content.created_at}>{formatISODate(content.created_at)}</time>
                  </span>
                </div>

                {/* 标题和摘要 */}
                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                  {content.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {content.excerpt}
                </p>

              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <Link href={`/post/${content.id}`} target="_blank">
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApprove(content.id)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  批准
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectClick(content.id)}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  拒绝
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 拒绝对话框 */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝内容</DialogTitle>
            <DialogDescription>
              请说明拒绝原因，作者将收到通知
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="请输入拒绝原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isSubmitting || !rejectReason.trim()}
            >
              {isSubmitting ? '提交中...' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
