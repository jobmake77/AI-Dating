import { requireAdmin } from '@/lib/middleware/admin'
import { getContentCategories } from '@/lib/queries/content-categories'
import { saveContentCategory, deleteContentCategory } from '@/lib/actions/content-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const categories = await getContentCategories({ includeInactive: true })

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">分类管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          在后台维护内容分类。分类变更后，创建内容、探索页和内容流会同步读取最新配置。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">新建分类</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            适合新增业务话题，例如官方通告、活动专题、内容栏目等。
          </p>

          <form action={saveContentCategory} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="create-category-name">
                分类名称
              </label>
              <Input id="create-category-name" name="name" placeholder="例如：官方通告" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="create-category-slug">
                标识 slug
              </label>
              <Input id="create-category-slug" name="slug" placeholder="official-news" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="create-category-description">
                描述
              </label>
              <Textarea
                id="create-category-description"
                name="description"
                placeholder="说明这个分类适合承载什么内容"
                className="min-h-24"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="create-category-role">
                  可见角色
                </label>
                <select
                  id="create-category-role"
                  name="required_role"
                  defaultValue="user"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="user">所有用户</option>
                  <option value="admin">仅管理员</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="create-category-color">
                  颜色
                </label>
                <Input id="create-category-color" name="color" defaultValue="221 83% 53%" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="create-category-sort">
                  排序
                </label>
                <Input id="create-category-sort" name="sort_order" type="number" min="0" defaultValue="100" />
              </div>

              <label className="mt-7 flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 rounded border-border" />
                启用分类
              </label>
            </div>

            <Button type="submit" className="w-full">
              保存分类
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">现有分类</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                修改 slug 时，会自动同步已有内容的分类值。
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              {categories.length} 个分类
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="rounded-xl border border-border p-4">
                <form action={saveContentCategory} className="space-y-4">
                  <input type="hidden" name="id" value={category.id} />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">分类名称</label>
                      <Input name="name" defaultValue={category.name} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">slug</label>
                      <Input name="slug" defaultValue={category.slug} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">描述</label>
                    <Textarea name="description" defaultValue={category.description} className="min-h-20" />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">可见角色</label>
                      <select
                        name="required_role"
                        defaultValue={category.requiredRole}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="user">所有用户</option>
                        <option value="admin">仅管理员</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">颜色</label>
                      <Input name="color" defaultValue={category.color} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">排序</label>
                      <Input name="sort_order" type="number" min="0" defaultValue={category.sortOrder} />
                    </div>

                    <label className="mt-7 flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={category.isActive}
                        className="h-4 w-4 rounded border-border"
                      />
                      启用
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: `hsl(${category.color})` }}
                      />
                      <span>{category.requiredRole === 'admin' ? '管理员专用分类' : '全站分类'}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" variant="outline">
                        更新
                      </Button>
                    </div>
                  </div>
                </form>

                <form action={deleteContentCategory} className="mt-3">
                  <input type="hidden" name="id" value={category.id} />
                  <Button type="submit" variant="ghost" className="text-destructive hover:text-destructive">
                    删除或停用
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
