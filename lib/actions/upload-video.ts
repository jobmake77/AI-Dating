'use server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

// Map contentType -> allowed extensions
const TYPE_EXT_MAP: Record<string, string[]> = {
  'video/mp4': ['mp4'],
  'video/quicktime': ['mov'],
  'video/webm': ['webm'],
  'video/x-msvideo': ['avi'],
}

// Validation schemas
const videoUploadSchema = z.object({
  filename: z.string().min(1, '文件名不能为空').max(255, '文件名过长'),
  contentType: z.enum(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'], {
    message: '只支持 MP4、MOV、WebM、AVI 格式的视频'
  }),
})

export async function getVideoUploadUrl(filename: string, contentType: string) {
  // Validate input
  const validation = videoUploadSchema.safeParse({ filename, contentType })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '请先登录' }
  }

  // Validate that file extension matches the declared contentType
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const allowedExts = TYPE_EXT_MAP[contentType] ?? []
  if (!allowedExts.includes(ext)) {
    return { error: '文件扩展名与视频类型不匹配' }
  }

  const key = `videos/${Date.now()}-${nanoid(8)}.${ext}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  try {
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 })
    const publicUrl = `${PUBLIC_URL}/${key}`
    return { uploadUrl, publicUrl, key }
  } catch (error) {
    logger.error('Failed to generate presigned URL:', error)
    return { error: '生成上传链接失败，请重试' }
  }
}
