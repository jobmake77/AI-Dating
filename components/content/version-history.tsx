'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getContentVersions, restoreContentVersion } from '@/lib/actions/content-versions'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { History, RotateCcw, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLocale, useTranslations } from 'use-intl'

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
  const t = useTranslations('versionHistory')
  const locale = useLocale()
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let active = true

    void getContentVersions(contentId).then((result) => {
      if (!active) {
        return
      }

      if (result.error) {
        toast({
          variant: 'destructive',
          title: t('loadFailed'),
          description: result.error,
        })
      } else if (result.data) {
        setVersions(result.data as ContentVersion[])
      }

      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [contentId, t, toast])

  const handleRestore = async (versionId: string) => {
    if (!confirm(t('restoreConfirm'))) {
      return
    }

    const result = await restoreContentVersion(contentId, versionId)

    if (result.error) {
      toast({
        variant: 'destructive',
        title: t('restoreFailed'),
        description: result.error,
      })
    } else {
      toast({
        title: t('restoreSuccess'),
        description: t('restoreSuccessDescription'),
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
          <h3 className="text-lg font-semibold">{t('title')}</h3>
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
          <h3 className="text-lg font-semibold">{t('title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('title')}</h3>
        </div>

        <div className="space-y-3">
          {versions.map((version, index) => (
            <div key={version.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {t('versionLabel', { version: version.version_number })}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {t('current')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(version.created_at), {
                      addSuffix: true,
                      locale: locale === 'en' ? enUS : zhCN,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('editedBy', { name: version.author.full_name || version.author.username })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t('preview')}
                  </Button>
                  {isAuthor && index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      {t('restore')}
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
              {t('previewVersion', { version: selectedVersion?.version_number ?? '' })}
            </DialogTitle>
            <DialogDescription>
              {selectedVersion &&
                formatDistanceToNow(new Date(selectedVersion.created_at), {
                  addSuffix: true,
                  locale: locale === 'en' ? enUS : zhCN,
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
