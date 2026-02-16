'use client'

import { useState } from 'react'
import { uploadImage } from '@/lib/actions/upload'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Upload, User } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onUploadSuccess: (url: string) => void
}

export function AvatarUpload({ currentAvatar, onUploadSuccess }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentAvatar)

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

    const result = await uploadImage(formData, 'avatars')
    setIsUploading(false)

    if (result.error) {
      toast.error('上传失败', { description: result.error })
      setPreviewUrl(currentAvatar) // 恢复原头像
      return
    }

    toast.success('上传成功', { description: '头像已更新' })
    onUploadSuccess(result.url!)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-20 h-20">
        <AvatarImage src={previewUrl || undefined} />
        <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
      </Avatar>

      <div>
        <input
          type="file"
          id="avatar-upload"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <label htmlFor="avatar-upload">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? '上传中...' : '上传头像'}
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          支持 JPG、PNG、GIF、WebP，最大 5MB
        </p>
      </div>
    </div>
  )
}
