import { getContents } from '@/lib/queries/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContentModeration } from '@/components/admin/content-moderation'
import { TagList } from '@/components/tag/tag-list'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

type PendingContents = Awaited<ReturnType<typeof getContents>>['contents']

export default async function AdminContentsPage() {
  let contents: PendingContents = []
  let fetchError: string | null = null

  try {
    const result = await getContents({ status: 'pending', limit: 50 })
    contents = result.contents
  } catch (error) {
    fetchError = error instanceof Error ? error.message : '加载失败'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">内容管理</h1>
        <p className="text-muted-foreground mt-1">审核待发布的内容</p>
      </div>

      {fetchError ? (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{fetchError}</span>
        </div>
      ) : contents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">暂无待审核内容</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contents.map((content) => (
            <Card key={content.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      <Link href={`/post/${content.id}`} className="hover:text-primary transition-colors" target="_blank">
                        {content.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      作者：{content.users?.full_name || content.users?.username}
                    </p>
                    {content.tags && content.tags.length > 0 && (
                      <TagList tags={content.tags} linkable={false} />
                    )}
                  </div>
                  <ContentModeration contentId={content.id} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{content.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
