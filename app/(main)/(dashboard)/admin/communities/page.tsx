import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { saveAdminCommunity, deleteAdminCommunity } from '@/lib/actions/admin-communities'
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
  description: string | null
  icon_url: string | null
  cover_url: string | null
  type: string
  members_count: number
  posts_count: number
  created_at: string
  users: {
    username: string
    full_name: string | null
  } | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('zh-CN')
}

export default async function AdminCommunitiesPage() {
  const supabase = await createClient()
  const { data = [] } = await supabase
    .from('communities')
    .select(`
      id,
      name,
      slug,
      description,
      icon_url,
      cover_url,
      type,
      members_count,
      posts_count,
      created_at,
      users!communities_creator_id_fkey(username, full_name)
    `)
    .order('created_at', { ascending: false })

  const communities: CommunityRecord[] = (data || []).map((community) => ({
    ...community,
    users: normalizeSingleRelation(community.users),
  }))
  const publicCount = communities.filter((community) => community.type === 'public').length
  const privateCount = communities.length - publicCount

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">平台级社区管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          统一查看全站社区，支持后台创建、编辑和删除，避免平台运营能力只停留在社区内局部设置。
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">社区总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">公开社区</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">私密社区</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privateCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>新建平台社区</CardTitle>
            <CardDescription>管理员可以直接创建官方或运营用途的社区。</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveAdminCommunity} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="community-name">
                  社区名称
                </label>
                <Input id="community-name" name="name" placeholder="例如：官方公告" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="community-slug">
                  slug
                </label>
                <Input id="community-slug" name="slug" placeholder="official-updates" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="community-description">
                  描述
                </label>
                <Textarea
                  id="community-description"
                  name="description"
                  placeholder="概述这个社区的定位和适用内容"
                  className="min-h-24"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="community-type">
                    社区类型
                  </label>
                  <select
                    id="community-type"
                    name="type"
                    defaultValue="public"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="public">公开</option>
                    <option value="private">私密</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="community-icon">
                    图标链接
                  </label>
                  <Input id="community-icon" name="icon_url" placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="community-cover">
                  封面链接
                </label>
                <Input id="community-cover" name="cover_url" placeholder="https://..." />
              </div>

              <Button type="submit" className="w-full">
                创建社区
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>社区列表</CardTitle>
            <CardDescription>这里展示的是全站社区，而不是仅限当前管理员加入过的社区。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {communities.length === 0 ? (
              <p className="text-sm text-muted-foreground">当前还没有社区。</p>
            ) : (
              communities.map((community) => (
                <div key={community.id} className="rounded-xl border border-border p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant={community.type === 'public' ? 'secondary' : 'outline'}>
                      {community.type === 'public' ? '公开社区' : '私密社区'}
                    </Badge>
                    <Badge variant="outline">{community.members_count} 成员</Badge>
                    <Badge variant="outline">{community.posts_count} 帖子</Badge>
                    <Badge variant="outline">创建于 {formatDate(community.created_at)}</Badge>
                  </div>

                  <div className="mb-4 text-sm text-muted-foreground">
                    创建者：{community.users?.full_name || community.users?.username || '未知用户'}
                    {' · '}
                    <Link href={`/communities/${community.slug}`} className="text-primary hover:underline" target="_blank">
                      前台查看
                    </Link>
                  </div>

                  <form action={saveAdminCommunity} className="space-y-4">
                    <input type="hidden" name="id" value={community.id} />

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">社区名称</label>
                        <Input name="name" defaultValue={community.name} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">slug</label>
                        <Input name="slug" defaultValue={community.slug} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">描述</label>
                      <Textarea name="description" defaultValue={community.description || ''} className="min-h-20" />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">社区类型</label>
                        <select
                          name="type"
                          defaultValue={community.type}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="public">公开</option>
                          <option value="private">私密</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">图标链接</label>
                        <Input name="icon_url" defaultValue={community.icon_url || ''} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">封面链接</label>
                        <Input name="cover_url" defaultValue={community.cover_url || ''} />
                      </div>
                    </div>

                    <Button type="submit" variant="outline">
                      更新社区
                    </Button>
                  </form>

                  <form action={deleteAdminCommunity} className="mt-3">
                    <input type="hidden" name="community_id" value={community.id} />
                    <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
                      删除社区
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
