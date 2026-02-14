import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TagBadge } from './tag-badge'
import { TrendingUp, Search, Edit } from 'lucide-react'

async function getTrendingTags() {
  const supabase = await createClient()

  // Get all approved contents with tags
  const { data: contents } = await supabase
    .from('contents')
    .select('tags')
    .eq('status', 'approved')
    .not('tags', 'is', null)

  if (!contents) return []

  // Count tag occurrences
  const tagCounts = new Map<string, number>()
  contents.forEach((content) => {
    if (content.tags && Array.isArray(content.tags)) {
      content.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    }
  })

  // Sort by count and get top 10
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))
}

export async function TrendingTags() {
  const trendingTags = await getTrendingTags()

  if (trendingTags.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          热门标签
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {trendingTags.map(({ tag, count }, index) => (
            <div key={tag} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}
                </span>
                <TagBadge tag={tag} href={`/tag/${encodeURIComponent(tag)}`} />
              </div>
              <span className="text-sm text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Edit className="h-4 w-4" />
            <span>创作时最常用</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>搜索最多（即将推出）</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
