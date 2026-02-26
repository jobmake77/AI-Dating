import { createClient } from '@/lib/supabase/server'
import { TagBadge } from './tag-badge'
import Link from 'next/link'

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
    <div className="border border-border/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">热门标签</h3>
        <span className="text-xs text-muted-foreground">趋势</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {trendingTags.map(({ tag, count }, index) => (
          <Link
            key={tag}
            href={`/tag/${encodeURIComponent(tag)}`}
            className="flex items-center justify-between py-1.5 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-muted-foreground w-5 text-center">
                {index + 1}
              </span>
              <TagBadge tag={tag} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{count}</span>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">按搜索量排序</p>
    </div>
  )
}
