'use client'

import { useRef, useState } from 'react'
import { getVideoUploadUrl } from '@/lib/actions/upload-video'

const MAX_SIZE = 500 * 1024 * 1024 // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo']

interface VideoUploadProps {
  onUploadSuccess: (url: string) => void
  onError: (message: string) => void
}

export function useVideoUpload({ onUploadSuccess, onError }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      onError('只支持 MP4、MOV、WebM、AVI 格式的视频')
      return
    }
    if (file.size > MAX_SIZE) {
      onError('视频大小不能超过 500MB')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const result = await getVideoUploadUrl(file.name, file.type)
      if ('error' in result) {
        onError(result.error!)
        return
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(Math.round((ev.loaded / ev.total) * 100))
          }
        }
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)))
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('PUT', result.uploadUrl!)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      onUploadSuccess(result.publicUrl!)
    } catch (err) {
      console.error('Video upload error:', err)
      onError('视频上传失败，请重试')
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return { fileInputRef, uploading, progress, handleFileChange }
}
