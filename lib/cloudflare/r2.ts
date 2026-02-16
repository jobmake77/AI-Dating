import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

// Cloudflare R2 client configuration
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

export interface UploadResult {
  url: string
  key: string
}

/**
 * Upload file to Cloudflare R2
 * @param file File buffer
 * @param contentType MIME type
 * @param folder Optional folder path
 * @returns Public URL and storage key
 */
export async function uploadToR2(
  file: Buffer,
  contentType: string,
  folder: string = 'images'
): Promise<UploadResult> {
  // Generate unique filename
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `${folder}/${Date.now()}-${nanoid(8)}.${ext}`

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await r2Client.send(command)

  // Return public URL
  const url = `${PUBLIC_URL}/${key}`
  return { url, key }
}

/**
 * Validate image file
 * @param file File to validate
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File): string | null {
  // Check file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return '图片大小不能超过 10MB'
  }

  // Check file type
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return '只支持 JPG、PNG、GIF、WebP 格式的图片'
  }

  return null
}
