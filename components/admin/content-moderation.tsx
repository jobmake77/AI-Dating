'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { approveContent, rejectContent } from '@/lib/actions/moderation'
import { useRouter } from 'next/navigation'

interface ContentModerationProps {
  contentId: string
}

export function ContentModeration({ contentId }: ContentModerationProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await approveContent(contentId)
      router.refresh()
    } catch (error) {
      console.error('Failed to approve content:', error)
      alert('审核失败，请重试')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('请填写拒绝原因')
      return
    }

    setIsRejecting(true)
    try {
      await rejectContent(contentId, rejectReason)
      setDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to reject content:', error)
      alert('审核失败，请重试')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleApprove}
        disabled={isApproving}
        variant="default"
      >
        {isApproving ? '审核中...' : '批准'}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">拒绝</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝内容</DialogTitle>
            <DialogDescription>
              请说明拒绝原因，这将通知作者
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">拒绝原因</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="例如：内容不符合社区规范、包含敏感信息等"
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isRejecting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? '处理中...' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
