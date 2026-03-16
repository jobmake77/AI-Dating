import { createClient } from '@/lib/supabase/server'
import { updateAdminExportRequest, updateAdminDeletionRequest } from '@/lib/actions/admin-privacy'
import { normalizeSingleRelation } from '@/lib/utils/normalize'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type ExportRequestRecord = {
  id: string
  user_id: string
  status: string
  requested_at: string
  completed_at: string | null
  download_url: string | null
  expires_at: string | null
  error_message: string | null
  users: {
    username: string
    full_name: string | null
    email: string | null
    deleted_at: string | null
  } | null
}

type DeletionRequestRecord = {
  id: string
  user_id: string
  status: string
  requested_at: string
  completed_at: string | null
  reason: string | null
  users: {
    username: string
    full_name: string | null
    email: string | null
    deleted_at: string | null
  } | null
}

function formatDateTime(value: string | null) {
  if (!value) return '未处理'
  return new Date(value).toLocaleString('zh-CN')
}

function formatDateTimeLocal(value: string | null) {
  if (!value) return ''

  const date = new Date(value)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default async function AdminPrivacyRequestsPage() {
  const supabase = await createClient()
  const [{ data: exportRequests = [] }, { data: deletionRequests = [] }] = await Promise.all([
    supabase
      .from('data_export_requests')
      .select(`
        id,
        user_id,
        status,
        requested_at,
        completed_at,
        download_url,
        expires_at,
        error_message,
        users(username, full_name, email, deleted_at)
      `)
      .order('requested_at', { ascending: false }),
    supabase
      .from('account_deletion_requests')
      .select(`
        id,
        user_id,
        status,
        requested_at,
        completed_at,
        reason,
        users(username, full_name, email, deleted_at)
      `)
      .order('requested_at', { ascending: false }),
  ])

  const exportData: ExportRequestRecord[] = (exportRequests || []).map((request) => ({
    ...request,
    users: normalizeSingleRelation(request.users),
  }))
  const deletionData: DeletionRequestRecord[] = (deletionRequests || []).map((request) => ({
    ...request,
    users: normalizeSingleRelation(request.users),
  }))
  const pendingExports = exportData.filter((item) => item.status === 'pending' || item.status === 'processing').length
  const pendingDeletions = deletionData.filter((item) => item.status === 'pending' || item.status === 'processing').length

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">数据导出 / 注销请求</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          这里展示真实的用户隐私请求。用户提交后不会自动完成，必须由后台推进状态，保证审计链完整。
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">导出请求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exportData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">待处理导出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">注销请求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deletionData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">待处理注销</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeletions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>数据导出请求</CardTitle>
            <CardDescription>标记完成后，系统会自动给用户暴露受限下载地址，默认 7 天过期。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exportData.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无数据导出请求。</p>
            ) : (
              exportData.map((request) => (
                <div key={request.id} className="rounded-xl border border-border p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant={request.status === 'completed' ? 'secondary' : 'outline'}>
                      {request.status}
                    </Badge>
                    {request.users?.deleted_at && <Badge variant="destructive">用户已注销</Badge>}
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                    <p>
                      用户：{request.users?.full_name || request.users?.username || '未知用户'}
                      {' · '}
                      {request.users?.email || '无邮箱'}
                    </p>
                    <p>请求时间：{formatDateTime(request.requested_at)}</p>
                    <p>完成时间：{formatDateTime(request.completed_at)}</p>
                  </div>

                  <form action={updateAdminExportRequest} className="space-y-4">
                    <input type="hidden" name="request_id" value={request.id} />

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">状态</label>
                        <select
                          name="status"
                          defaultValue={request.status}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="completed">completed</option>
                          <option value="failed">failed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">下载链接</label>
                        <Input name="download_url" defaultValue={request.download_url || ''} placeholder="留空则自动生成" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">过期时间</label>
                        <Input name="expires_at" type="datetime-local" defaultValue={formatDateTimeLocal(request.expires_at)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">失败原因</label>
                      <Textarea name="error_message" defaultValue={request.error_message || ''} className="min-h-20" />
                    </div>

                    <Button type="submit" variant="outline">
                      更新导出请求
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户注销请求</CardTitle>
            <CardDescription>当状态切为 completed 时，系统会执行真实匿名化，不再是前台即时删除的假流程。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deletionData.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无账户注销请求。</p>
            ) : (
              deletionData.map((request) => (
                <div key={request.id} className="rounded-xl border border-border p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant={request.status === 'completed' ? 'secondary' : 'outline'}>
                      {request.status}
                    </Badge>
                    {request.users?.deleted_at && <Badge variant="destructive">已完成匿名化</Badge>}
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                    <p>
                      用户：{request.users?.full_name || request.users?.username || '未知用户'}
                      {' · '}
                      {request.users?.email || '无邮箱'}
                    </p>
                    <p>请求时间：{formatDateTime(request.requested_at)}</p>
                    <p>完成时间：{formatDateTime(request.completed_at)}</p>
                    <p>用户理由：{request.reason || '未填写'}</p>
                  </div>

                  <form action={updateAdminDeletionRequest} className="flex flex-wrap items-end gap-4">
                    <input type="hidden" name="request_id" value={request.id} />

                    <div className="w-full max-w-xs space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">状态</label>
                      <select
                        name="status"
                        defaultValue={request.status}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>

                    <Button type="submit" variant="outline">
                      更新注销请求
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
