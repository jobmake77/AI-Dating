import { getPendingContents, getModerationStats } from '@/lib/actions/moderation'
import { ModerationList } from '@/components/admin/moderation-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default async function ModerationPage() {
  type PendingContents = Awaited<ReturnType<typeof getPendingContents>>

  let contents: PendingContents = []
  let stats = { pending: 0, approved: 0, rejected: 0 }
  let error: string | null = null

  try {
    ;[contents, stats] = await Promise.all([
      getPendingContents(),
      getModerationStats(),
    ])
  } catch (e) {
    error = e instanceof Error ? e.message : '加载失败'
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>加载失败：{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">内容审核</h1>
        <p className="text-muted-foreground">审核用户提交的内容</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">需要处理</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已批准</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">已发布</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">未通过</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总计</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pending + stats.approved + stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">所有内容</p>
          </CardContent>
        </Card>
      </div>

      {/* 待审核列表 */}
      <Card>
        <CardHeader>
          <CardTitle>待审核内容</CardTitle>
          <CardDescription>
            {contents.length === 0
              ? '暂无待审核内容'
              : `共 ${contents.length} 篇内容待审核`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModerationList contents={contents} />
        </CardContent>
      </Card>
    </div>
  )
}
