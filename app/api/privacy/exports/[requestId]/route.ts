import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { collectUserDataExport } from '@/lib/privacy/export'

const requestIdSchema = z.string().uuid('无效的导出请求 ID')

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params
  const validation = requestIdSchema.safeParse(requestId)

  if (!validation.success) {
    return Response.json({ error: validation.error.issues[0]?.message || '请求参数不合法' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: '请先登录' }, { status: 401 })
  }

  const { data: exportRequest, error: requestError } = await supabase
    .from('data_export_requests')
    .select('id, user_id, status, expires_at')
    .eq('id', validation.data)
    .maybeSingle()

  if (requestError || !exportRequest) {
    return Response.json({ error: '导出请求不存在' }, { status: 404 })
  }

  if (exportRequest.user_id !== user.id) {
    return Response.json({ error: '无权访问该导出文件' }, { status: 403 })
  }

  if (exportRequest.status !== 'completed') {
    return Response.json({ error: '导出文件尚未准备完成' }, { status: 409 })
  }

  if (exportRequest.expires_at && new Date(exportRequest.expires_at).getTime() < Date.now()) {
    return Response.json({ error: '导出文件已过期，请重新发起请求' }, { status: 410 })
  }

  const exportData = await collectUserDataExport(supabase, user.id)
  const filename = `ai-dating-data-export-${new Date().toISOString().slice(0, 10)}.json`

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
