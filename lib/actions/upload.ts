'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadToR2, validateImageFile } from '@/lib/cloudflare/r2'

export async function uploadImage(formData: FormData) {
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

    // Upload to R2
    const result = await uploadToR2(buffer, file.type, 'content-images')

    return { url: result.url, key: result.key }
  } catch (error) {
    console.error('Image upload error:', error)
    return { error: '图片上传失败，请重试' }
  }
}
