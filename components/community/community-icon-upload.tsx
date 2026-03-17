'use client'

import { useState } from 'react'
import { uploadImage } from '@/lib/actions/upload'
import { Button } from '@/components/ui/button'
import { Upload, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ImageCropper } from '@/components/ui/image-cropper'
import Image from 'next/image'

interface CommunityIconUploadProps {
  currentIcon?: string | null
  onUploadSuccess: (url: string) => void
}

export function CommunityIconUpload({ currentIcon, onUploadSuccess }: CommunityIconUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentIcon)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 读取文件并显示裁剪器
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageToCrop(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setImageToCrop(null)

    // 客户端预览
    const localPreviewUrl = URL.createObjectURL(croppedBlob)
    setPreviewUrl(localPreviewUrl)

    // 上传到 R2
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', croppedBlob, 'community-icon.jpg')

    const result = await uploadImage(formData, 'community-icons')
    setIsUploading(false)

    if (result.error) {
      toast.error('上传失败', { description: result.error })
      setPreviewUrl(currentIcon)
      return
    }

    toast.success('上传成功', { description: '社区图标已更新' })
    setPreviewUrl(result.url!)
    onUploadSuccess(result.url!)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="社区图标"
            width={80}
            height={80}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <div>
        <input
          type="file"
          id="community-icon-upload"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <label htmlFor="community-icon-upload">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? '上传中...' : previewUrl ? '更换图标' : '上传图标'}
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          建议尺寸 512x512，支持 JPG、PNG、GIF、WebP，最大 10MB
        </p>
      </div>

      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
          aspect={1}
          shape="rect"
        />
      )}
    </div>
  )
}
