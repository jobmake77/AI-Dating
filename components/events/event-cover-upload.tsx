'use client'

import { useState } from 'react'
import { uploadImage } from '@/lib/actions/upload'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ImageCropper } from '@/components/ui/image-cropper'

interface EventCoverUploadProps {
  currentCover?: string | null
  onUploadSuccess: (url: string) => void
  onRemove?: () => void
}

export function EventCoverUpload({ currentCover, onUploadSuccess, onRemove }: EventCoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentCover)
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageToCrop(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setImageToCrop(null)

    const preview = URL.createObjectURL(croppedBlob)
    setPreviewUrl(preview)

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', croppedBlob, 'event-cover.jpg')

    const result = await uploadImage(formData, 'event-covers')
    setIsUploading(false)

    if (result.error) {
      toast.error('上传失败', { description: result.error })
      setPreviewUrl(currentCover)
      return
    }

    toast.success('上传成功', { description: '活动封面已更新' })
    onUploadSuccess(result.url!)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onRemove?.()
  }

  return (
    <div className="space-y-3">
      {!isExpanded && (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsExpanded(true)}
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {previewUrl ? '已设置封面图' : '添加封面图（可选）'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {isExpanded && (
        <div className="space-y-3 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">封面图设置</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
              <Image src={previewUrl} alt="封面图预览" fill className="object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">暂无封面图</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              id="event-cover-upload"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="event-cover-upload" className="flex-1">
              <Button type="button" variant="outline" disabled={isUploading} className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? '上传中...' : previewUrl ? '更换封面图' : '上传封面图'}
                </span>
              </Button>
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            建议尺寸 1200x630，支持 JPG、PNG、GIF、WebP，最大 10MB
          </p>
        </div>
      )}

      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
          aspect={16 / 9}
          shape="rect"
        />
      )}
    </div>
  )
}
