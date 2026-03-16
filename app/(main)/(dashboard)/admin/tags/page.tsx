import { createClient } from '@/lib/supabase/server'
import { saveAdminTag, mergeAdminTag, deleteAdminTag } from '@/lib/actions/admin-tags'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function formatDate(value: string | null) {
  if (!value) return '未知'
  return new Date(value).toLocaleDateString('zh-CN')
}

export default async function AdminTagsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .order('name', { ascending: true })

  const tags = data ?? []
  const usedTags = tags.filter((tag) => (tag.usage_count || 0) > 0).length
  const unusedTags = tags.length - usedTags

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">标签管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          统一维护标签名称、描述和合并逻辑，避免内容流、搜索和探索页出现重复标签或脏数据。
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">标签总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">使用中的标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedTags}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">待清理标签</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unusedTags}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>新建标签</CardTitle>
            <CardDescription>适合补充标准化标签，例如业务专题、活动主题、官方标签。</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveAdminTag} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="create-tag-name">
                  标签名称
                </label>
                <Input id="create-tag-name" name="name" placeholder="例如：官方通告" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="create-tag-slug">
                  slug
                </label>
                <Input id="create-tag-slug" name="slug" placeholder="official-notice" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="create-tag-description">
                  描述
                </label>
                <Textarea
                  id="create-tag-description"
                  name="description"
                  placeholder="说明这个标签适用于哪些内容"
                  className="min-h-24"
                />
              </div>

              <Button type="submit" className="w-full">
                保存标签
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>现有标签</CardTitle>
            <CardDescription>
              支持直接改名、改描述、合并重复标签。删除前会检查是否仍被内容引用。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">当前还没有标签。</p>
            ) : (
              tags.map((tag) => (
                <div key={tag.id} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{tag.usage_count || 0} 次使用</Badge>
                    <Badge variant="outline">创建于 {formatDate(tag.created_at)}</Badge>
                  </div>

                  <form action={saveAdminTag} className="space-y-4">
                    <input type="hidden" name="id" value={tag.id} />

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">标签名称</label>
                        <Input name="name" defaultValue={tag.name} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">slug</label>
                        <Input name="slug" defaultValue={tag.slug} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">描述</label>
                      <Textarea name="description" defaultValue={tag.description || ''} className="min-h-20" />
                    </div>

                    <Button type="submit" variant="outline">
                      更新标签
                    </Button>
                  </form>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <form action={mergeAdminTag} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <input type="hidden" name="source_tag_id" value={tag.id} />
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">合并到目标标签</label>
                        <Input name="target_tag_name" placeholder="输入已有标签名或新标签名" required />
                      </div>
                      <Button type="submit" variant="secondary">
                        合并
                      </Button>
                    </form>

                    <form action={deleteAdminTag} className="flex items-end">
                      <input type="hidden" name="tag_id" value={tag.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={(tag.usage_count || 0) > 0}
                      >
                        删除
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
