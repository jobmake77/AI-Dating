import { getTrendingContents } from '@/lib/actions/recommendations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export async function TrendingContents() {
  const trendingContents = await getTrendingContents({ limit: 5, timeRange: 'week' })

  if (trendingContents.length === 0) {
    return null
  }

  return (
    <Card className="border-border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <Link href="/trending" className="hover:text-primary transition-colors">
          <CardTitle className="text-base">
            热门内容
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {trendingContents.map((content, index) => (
            <Link
              key={content.id}
              href={`/c/${content.id}`}
              className="flex items-start gap-2.5 py-2 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors group"
            >
              <span className="text-xs font-medium text-muted-foreground w-5 text-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {content.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={content.users?.avatar || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {(content.users?.full_name || content.users?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {content.users?.full_name || content.users?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {content.likes_count} 赞
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/trending"
          className="flex items-center justify-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors pt-2 border-t"
        >
          <span>查看完整排行榜</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
