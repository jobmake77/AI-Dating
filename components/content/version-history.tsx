'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getContentVersions, restoreContentVersion } from '@/lib/actions/content-versions'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { History, RotateCcw, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ContentVersion {
  id: string
  version_number: number
  title: string
  content: string
  created_at: string
  author: {
    username: string
    full_name: string
    avatar: string | null
  }
}

interface VersionHistoryProps {
  contentId: string
  isAuthor: boolean
}

export function VersionHistory({ contentId, isAuthor }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadVersions()
  }, [contentId])

  const loadVersions = async () => {
    setLoading(true)
    const result = await getContentVersions(contentId)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: '加载失败',
        description: result.error,
      })
    } else if (result.data) {
      setVersions(result.data as ContentVersion[])
    }

    setLoading(false)
  }

  const handleRestore = async (versionId: string) => {
    if (!confirm('确定要恢复到这个版本吗？当前内容将被替换。')) {
      return
    }

    const result = await restoreContentVersion(contentId, versionId)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: '恢复失败',
        description: result.error,
      })
    } else {
      toast({
        title: '恢复成功',
        description: '内容已恢复到选定版本',
      })
      // Reload page to show updated content
      window.location.reload()
    }
  }

  const handlePreview = (version: ContentVersion) => {
    setSelectedVersion(version)
    setShowPreview(true)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">版本历史</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  if (versions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">版本历史</h3>
        </div>
        <p className="text-sm text-muted-foreground">暂无版本历史</p>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">版本历史</h3>
        </div>

        <div className="space-y-3">
          {versions.map((version, index) => (
            <div key={version.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      版本 {version.version_number}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        当前版本
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(version.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    由 {version.author.full_name || version.author.username} 编辑
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    预览
                  </Button>
                  {isAuthor && index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      恢复
                    </Button>
                  )}
                </div>
              </div>
              {index < versions.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              版本 {selectedVersion?.version_number} 预览
            </DialogTitle>
            <DialogDescription>
              {selectedVersion &&
                formatDistanceToNow(new Date(selectedVersion.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedVersion && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-4">{selectedVersion.title}</h2>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
