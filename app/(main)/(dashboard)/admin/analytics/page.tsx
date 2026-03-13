import { requireAdmin } from '@/lib/middleware/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/analytics/stat-card'
import { LineChartComponent } from '@/components/analytics/line-chart'
import { RetentionTable } from '@/components/analytics/retention-table'
import {
  getOverviewStats,
  getUserGrowthData,
  getUserRetentionData,
  getTopContents,
} from '@/lib/actions/analytics'

export default async function AnalyticsPage() {
  await requireAdmin()

  // 并行获取所有数据
  const [
    overviewStats,
    growthData,
    retentionData,
    topContents,
  ] = await Promise.all([
    getOverviewStats(),
    getUserGrowthData(30),
    getUserRetentionData(),
    getTopContents(10),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">数据看板</h1>
        <p className="text-muted-foreground mt-1">平台数据分析与洞察</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="users">用户分析</TabsTrigger>
        </TabsList>

        {/* 概览 Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="总用户数"
              value={overviewStats.totalUsers}
              icon="users"
              description="平台注册用户总数"
            />
            <StatCard
              title="日活跃用户"
              value={overviewStats.activeUsersToday}
              icon="activity"
              description="今日活跃用户数"
            />
            <StatCard
              title="周活跃用户"
              value={overviewStats.activeUsersWeek}
              icon="trendingUp"
              description="近 7 天活跃用户数"
            />
            <StatCard
              title="月活跃用户"
              value={overviewStats.activeUsersMonth}
              icon="trendingUp"
              description="近 30 天活跃用户数"
            />
            <StatCard
              title="总内容数"
              value={overviewStats.totalContents}
              icon="fileText"
              description="平台内容总数"
            />
          </div>

          {/* 增长趋势图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">近 30 天增长趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent
                data={growthData}
                lines={[
                  { dataKey: 'users', stroke: '#3b82f6', name: '新增用户' },
                  { dataKey: 'contents', stroke: '#10b981', name: '新增内容' },
                ]}
                height={280}
              />
            </CardContent>
          </Card>

          {/* 热门内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">热门内容 Top 10</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    暂无数据
                  </p>
                ) : (
                  topContents.map((content, index) => (
                    <div
                      key={content.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{content.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by @{content.author}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{content.views} 浏览</span>
                        <span>{content.likes} 点赞</span>
                        <span>{content.comments} 评论</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户分析 Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* 用户增长趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">用户增长趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent
                data={growthData}
                lines={[{ dataKey: 'users', stroke: '#3b82f6', name: '新增用户' }]}
                height={280}
              />
            </CardContent>
          </Card>

          {/* 用户留存率 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">用户留存率</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                按周群组统计用户留存情况
              </p>
            </CardHeader>
            <CardContent>
              <RetentionTable data={retentionData} />
            </CardContent>
          </Card>

          {/* 活跃度指标 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="日活跃用户 (DAU)"
              value={overviewStats.activeUsersToday}
              icon="activity"
              description={`占总用户 ${
                overviewStats.totalUsers > 0
                  ? Math.round(
                      (overviewStats.activeUsersToday /
                        overviewStats.totalUsers) *
                        100
                    )
                  : 0
              }%`}
            />
            <StatCard
              title="周活跃用户 (WAU)"
              value={overviewStats.activeUsersWeek}
              icon="trendingUp"
              description={`占总用户 ${
                overviewStats.totalUsers > 0
                  ? Math.round(
                      (overviewStats.activeUsersWeek /
                        overviewStats.totalUsers) *
                        100
                    )
                  : 0
              }%`}
            />
            <StatCard
              title="月活跃用户 (MAU)"
              value={overviewStats.activeUsersMonth}
              icon="trendingUp"
              description={`占总用户 ${
                overviewStats.totalUsers > 0
                  ? Math.round(
                      (overviewStats.activeUsersMonth /
                        overviewStats.totalUsers) *
                        100
                    )
                  : 0
              }%`}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
