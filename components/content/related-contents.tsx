import { getRelatedContents } from '@/lib/actions/recommendations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Clock, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface RelatedContentsProps {
  contentId: string
}

export async function RelatedContents({ contentId }: RelatedContentsProps) {
  const relatedContents = await getRelatedContents(contentId, 5)

  if (relatedContents.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">相关推荐</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedContents.map((content: any) => (
          <Link
            key={content.id}
            href={`/post/${content.id}`}
            className="block group"
          >
            <div className="space-y-2">
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{content.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(content.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
