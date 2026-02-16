import { getTrendingContents } from '@/lib/actions/recommendations'
import { ContentCard } from '@/components/content/content-card-twitter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp } from 'lucide-react'

interface TrendingPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams
  const timeRange = (params.range as 'day' | 'week' | 'month' | 'all') || 'week'

  const trendingContents = await getTrendingContents({
    timeRange,
    limit: 20,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">热门内容</h1>
        </div>

        {/* 时间范围选择 */}
        <Tabs defaultValue={timeRange} className="mb-6">
          <TabsList>
            <TabsTrigger value="day" asChild>
              <a href="/trending?range=day">今日</a>
            </TabsTrigger>
            <TabsTrigger value="week" asChild>
              <a href="/trending?range=week">本周</a>
            </TabsTrigger>
            <TabsTrigger value="month" asChild>
              <a href="/trending?range=month">本月</a>
            </TabsTrigger>
            <TabsTrigger value="all" asChild>
              <a href="/trending?range=all">全部</a>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 内容列表 */}
        {trendingContents.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无热门内容</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            {trendingContents.map((content: any, index: number) => (
              <div key={content.id} className="relative">
                {/* 排名标识 */}
                <div className="absolute left-2 top-4 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="pl-12">
                  <ContentCard content={content} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
