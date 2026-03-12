'use server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { uploadToR2, validateImageFile, validateImageBuffer } from '@/lib/cloudflare/r2'

// Validation schema
const folderSchema = z.string().regex(/^[a-z0-9-]+$/, '文件夹名称只能包含小写字母、数字和连字符').max(50, '文件夹名称过长')

export async function uploadImage(formData: FormData, folder: string = 'content-images') {
  // Validate folder name
  const folderValidation = folderSchema.safeParse(folder)
  if (!folderValidation.success) {
    return { error: folderValidation.error.issues[0].message }
  }

  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '请先登录' }
  }

  // Get file from form data
  const file = formData.get('file') as File
  if (!file) {
    return { error: '请选择图片文件' }
  }

  // Validate file
  const validationError = validateImageFile(file)
  if (validationError) {
    return { error: validationError }
  }

  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Server-side magic bytes validation (prevents MIME spoofing)
    const bufferError = validateImageBuffer(buffer)
    if (bufferError) {
      return { error: bufferError }
    }

    // Upload to R2
    const result = await uploadToR2(buffer, file.type, folder)

    return { url: result.url, key: result.key }
  } catch (error) {
    logger.error('Image upload error:', error)
    return { error: '图片上传失败，请重试' }
  }
}
