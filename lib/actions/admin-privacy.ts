'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/middleware/admin'
import { performAccountDeletion } from '@/lib/actions/privacy'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

const exportRequestSchema = z.object({
  requestId: z.string().uuid('无效的导出请求 ID'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  downloadUrl: z.string().trim().url('下载链接格式不正确').optional().or(z.literal('')),
  expiresAt: z.string().optional(),
  errorMessage: z.string().trim().max(500, '错误信息过长').optional(),
})

const deletionRequestSchema = z.object({
  requestId: z.string().uuid('无效的注销请求 ID'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
})

function buildExportDownloadUrl(requestId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}/api/privacy/exports/${requestId}`
}

function revalidatePrivacyPaths() {
  revalidatePath('/admin/privacy-requests')
  revalidatePath('/settings/privacy')
}

export async function updateAdminExportRequest(formData: FormData) {
  await requireAdmin()

  const validation = exportRequestSchema.safeParse({
    requestId: formData.get('request_id')?.toString(),
    status: formData.get('status')?.toString(),
    downloadUrl: formData.get('download_url')?.toString().trim() || '',
    expiresAt: formData.get('expires_at')?.toString() || undefined,
    errorMessage: formData.get('error_message')?.toString() || undefined,
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '导出请求参数不合法')
  }

  const supabase = await createClient()
  const { data: request, error: requestError } = await supabase
    .from('data_export_requests')
    .select('id, status')
    .eq('id', validation.data.requestId)
    .single()

  if (requestError || !request) {
    logger.error('Failed to load export request before update:', requestError)
    throw new Error('导出请求不存在')
  }

  const now = new Date()
  const payload = {
    status: validation.data.status,
    completed_at: validation.data.status === 'completed' ? now.toISOString() : null,
    download_url:
      validation.data.status === 'completed'
        ? validation.data.downloadUrl || buildExportDownloadUrl(validation.data.requestId)
        : null,
    expires_at:
      validation.data.status === 'completed'
        ? validation.data.expiresAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    error_message: validation.data.status === 'failed' ? validation.data.errorMessage || '导出失败' : null,
  }

  if (request.status === 'completed' && validation.data.status !== 'completed') {
    throw new Error('已完成的导出请求不能回退状态')
  }

  const { error: updateError } = await supabase
    .from('data_export_requests')
    .update(payload)
    .eq('id', validation.data.requestId)

  if (updateError) {
    logger.error('Failed to update export request:', updateError)
    throw new Error(updateError.message)
  }

  revalidatePrivacyPaths()
}

export async function updateAdminDeletionRequest(formData: FormData) {
  await requireAdmin()

  const validation = deletionRequestSchema.safeParse({
    requestId: formData.get('request_id')?.toString(),
    status: formData.get('status')?.toString(),
  })

  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || '注销请求参数不合法')
  }

  const supabase = await createClient()
  const { data: request, error: requestError } = await supabase
    .from('account_deletion_requests')
    .select('id, user_id, status, completed_at')
    .eq('id', validation.data.requestId)
    .single()

  if (requestError || !request) {
    logger.error('Failed to load deletion request before update:', requestError)
    throw new Error('注销请求不存在')
  }

  if (request.completed_at && validation.data.status !== 'completed') {
    throw new Error('已完成的注销请求不能回退状态')
  }

  if (validation.data.status === 'completed' && request.status !== 'completed') {
    await performAccountDeletion(request.user_id, supabase)
  }

  const { error: updateError } = await supabase
    .from('account_deletion_requests')
    .update({
      status: validation.data.status,
      completed_at: validation.data.status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', validation.data.requestId)

  if (updateError) {
    logger.error('Failed to update deletion request:', updateError)
    throw new Error(updateError.message)
  }

  revalidatePrivacyPaths()
}
