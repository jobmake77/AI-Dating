import { createClient } from '@/lib/supabase/server'
import { saveCommunityRule, deleteCommunityRule } from '@/lib/actions/community-rules'
import { normalizeSingleRelation } from '@/lib/utils/normalize'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type CommunityRecord = {
  id: string
  name: string
  slug: string
}

type RuleRecord = {
  id: string
  community_id: string
  rule_text: string
  sort_order: number
  is_active: boolean
  created_at: string
  communities: {
    id: string
    name: string
    slug: string
  } | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('zh-CN')
}

export default async function AdminCommunityRulesPage() {
  const supabase = await createClient()
  const [{ data: communities = [] }, { data: rules = [] }] = await Promise.all([
    supabase.from('communities').select('id, name, slug').order('name', { ascending: true }),
    supabase
      .from('community_rules')
      .select(`
        id,
        community_id,
        rule_text,
        sort_order,
        is_active,
        created_at,
        communities(id, name, slug)
      `)
      .order('community_id', { ascending: true })
      .order('sort_order', { ascending: true }),
  ])

  const communityOptions = (communities || []) as CommunityRecord[]
  const ruleList: RuleRecord[] = (rules || []).map((rule) => ({
    ...rule,
    communities: normalizeSingleRelation(rule.communities),
  }))
  const activeRules = ruleList.filter((rule) => rule.is_active).length

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">社区规则管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          社区详情页右侧规则已改为数据库驱动。这里维护的规则会直接影响前台展示，不再依赖硬编码数组。
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">覆盖社区数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityOptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">规则总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ruleList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">启用中的规则</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>新增规则</CardTitle>
            <CardDescription>可以给任意社区补充差异化规则，默认排序越小越靠前。</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveCommunityRule} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="rule-community">
                  目标社区
                </label>
                <select
                  id="rule-community"
                  name="community_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={communityOptions[0]?.id}
                >
                  {communityOptions.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="rule-text">
                  规则内容
                </label>
                <Textarea id="rule-text" name="rule_text" className="min-h-24" placeholder="例如：禁止发布与社区主题无关的广告内容" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="rule-sort-order">
                  排序
                </label>
                <Input id="rule-sort-order" name="sort_order" type="number" min="0" defaultValue="100" />
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 rounded border-border" />
                启用规则
              </label>

              <Button type="submit" className="w-full">
                保存规则
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>现有规则</CardTitle>
            <CardDescription>规则会按排序值在前台展示，停用后不会出现在社区详情页。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ruleList.length === 0 ? (
              <p className="text-sm text-muted-foreground">当前还没有社区规则。</p>
            ) : (
              ruleList.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant={rule.is_active ? 'secondary' : 'outline'}>
                      {rule.is_active ? '已启用' : '已停用'}
                    </Badge>
                    <Badge variant="outline">排序 {rule.sort_order}</Badge>
                    <Badge variant="outline">创建于 {formatDate(rule.created_at)}</Badge>
                  </div>

                  <div className="mb-4 text-sm text-muted-foreground">
                    所属社区：{rule.communities?.name || '未知社区'}
                  </div>

                  <form action={saveCommunityRule} className="space-y-4">
                    <input type="hidden" name="id" value={rule.id} />

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">所属社区</label>
                      <select
                        name="community_id"
                        defaultValue={rule.community_id}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {communityOptions.map((community) => (
                          <option key={community.id} value={community.id}>
                            {community.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">规则内容</label>
                      <Textarea name="rule_text" defaultValue={rule.rule_text} className="min-h-20" />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[160px_auto]">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">排序</label>
                        <Input name="sort_order" type="number" min="0" defaultValue={rule.sort_order} />
                      </div>

                      <label className="mt-7 flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          name="is_active"
                          defaultChecked={rule.is_active}
                          className="h-4 w-4 rounded border-border"
                        />
                        启用
                      </label>
                    </div>

                    <Button type="submit" variant="outline">
                      更新规则
                    </Button>
                  </form>

                  <form action={deleteCommunityRule} className="mt-3">
                    <input type="hidden" name="rule_id" value={rule.id} />
                    <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
                      删除规则
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
