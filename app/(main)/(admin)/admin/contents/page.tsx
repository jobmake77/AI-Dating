import { requireAdmin } from '@/lib/middleware/admin'
import { getContents } from '@/lib/queries/content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContentModeration } from '@/components/admin/content-moderation'
import { TagList } from '@/components/tag/tag-list'
import Link from 'next/link'

export default async function AdminContentsPage() {
  await requireAdmin()

  const { contents } = await getContents({ status: 'pending', limit: 50 })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">内容审核</h1>
        <p className="text-muted-foreground mt-2">
          审核待发布的内容
        </p>
      </div>

      {contents.length === 0 ? (
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
                    <div className="flex items-center gap-2 mb-2">
                      {content.price_type === 'member' && (
                        <Badge variant="default">会员专享</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">
                      <Link
                        href={`/post/${content.id}`}
                        className="hover:text-primary transition-colors"
                        target="_blank"
                      >
                        {content.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      作者：{content.users.full_name || content.users.username}
                    </p>
                    {content.tags && content.tags.length > 0 && (
                      <TagList tags={content.tags} linkable={false} />
                    )}
                  </div>
                  <ContentModeration contentId={content.id} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {content.excerpt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
