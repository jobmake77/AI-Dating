'use client'

import { useState } from 'react'
import { uploadImage } from '@/lib/actions/upload'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface CoverImageUploadProps {
  currentCover?: string | null
  onUploadSuccess: (url: string) => void
  onRemove?: () => void
}

export function CoverImageUpload({ currentCover, onUploadSuccess, onRemove }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentCover)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 客户端预览
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)

    // 上传到 R2
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData, 'content-covers')
    setIsUploading(false)

    if (result.error) {
      toast.error('上传失败', { description: result.error })
      setPreviewUrl(currentCover)
      return
    }

    toast.success('上传成功', { description: '封面图已更新' })
    onUploadSuccess(result.url!)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onRemove?.()
  }

  return (
    <div className="space-y-3">
      {/* Collapsed State - Single Line */}
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

      {/* Expanded State - Full Upload Interface */}
      {isExpanded && (
        <div className="space-y-3 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">封面图设置</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
              <Image
                src={previewUrl}
                alt="封面图预览"
                fill
                className="object-cover"
              />
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
            <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">暂无封面图</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              id="cover-upload"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="cover-upload" className="flex-1">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                className="w-full"
                asChild
              >
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
    </div>
  )
}
