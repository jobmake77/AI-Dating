'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatMetricValue, getMetricDescription } from '@/lib/analytics/web-vitals'

type WebVitalMetricName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP'

interface WebVital {
  id: string
  metric_name: WebVitalMetricName
  metric_value: number
  metric_rating: 'good' | 'needs-improvement' | 'poor'
  created_at: string
}

interface PerformanceMetric {
  id: string
  page_url: string
  ttfb: number
  dom_content_loaded_time: number
  load_complete_time: number
  resource_count: number
  total_resource_size: number
  created_at: string
}

interface Props {
  webVitals: WebVital[]
  performanceMetrics: PerformanceMetric[]
}

interface WebVitalStats {
  name: WebVitalMetricName
  description: string
  avg: number
  p75: number
  p95: number
  count: number
  goodPercentage: number
  ratings: {
    good: number
    needsImprovement: number
    poor: number
  }
}

type TimeSeriesGroupedEntry = {
  date: string
} & Partial<Record<WebVitalMetricName, number[]>>

type TimeSeriesDataPoint = {
  date: string
} & Partial<Record<WebVitalMetricName, number>>

const metricNames: WebVitalMetricName[] = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP']

export function PerformanceDashboard({ webVitals, performanceMetrics }: Props) {
  // 计算 Web Vitals 统计
  const webVitalsStats = useMemo(() => {
    return metricNames
      .map((metricName): WebVitalStats | null => {
      const data = webVitals.filter((v) => v.metric_name === metricName)
      if (data.length === 0) return null

      const values = data.map((v) => v.metric_value)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const p75 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.75)]
      const p95 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)]

      const ratings = {
        good: data.filter((v) => v.metric_rating === 'good').length,
        needsImprovement: data.filter((v) => v.metric_rating === 'needs-improvement').length,
        poor: data.filter((v) => v.metric_rating === 'poor').length,
      }

      const goodPercentage = (ratings.good / data.length) * 100

      return {
        name: metricName,
        description: getMetricDescription(metricName),
        avg,
        p75,
        p95,
        count: data.length,
        goodPercentage,
        ratings,
      }
      })
      .filter((stat): stat is WebVitalStats => stat !== null)
  }, [webVitals])

  // 准备时间序列数据
  const timeSeriesData = useMemo(() => {
    const grouped = new Map<string, TimeSeriesGroupedEntry>()

    webVitals.forEach((v) => {
      const date = new Date(v.created_at).toLocaleDateString()
      let entry = grouped.get(date)

      if (!entry) {
        entry = { date }
        grouped.set(date, entry)
      }

      const values = entry[v.metric_name] ?? []
      values.push(v.metric_value)
      entry[v.metric_name] = values
    })

    return Array.from(grouped.values()).map((entry) => {
      const result: TimeSeriesDataPoint = { date: entry.date }

      metricNames.forEach((metricName) => {
        const values = entry[metricName]
        if (values && values.length > 0) {
          result[metricName] = values.reduce((a, b) => a + b, 0) / values.length
        }
      })

      return result
    })
  }, [webVitals])

  // 计算性能指标统计
  const performanceStats = useMemo(() => {
    if (performanceMetrics.length === 0) return null

    const avgTTFB = performanceMetrics.reduce((sum, m) => sum + (m.ttfb || 0), 0) / performanceMetrics.length
    const avgDOMContentLoaded = performanceMetrics.reduce((sum, m) => sum + (m.dom_content_loaded_time || 0), 0) / performanceMetrics.length
    const avgLoadComplete = performanceMetrics.reduce((sum, m) => sum + (m.load_complete_time || 0), 0) / performanceMetrics.length
    const avgResourceCount = performanceMetrics.reduce((sum, m) => sum + (m.resource_count || 0), 0) / performanceMetrics.length
    const avgResourceSize = performanceMetrics.reduce((sum, m) => sum + (m.total_resource_size || 0), 0) / performanceMetrics.length

    return {
      avgTTFB: Math.round(avgTTFB),
      avgDOMContentLoaded: Math.round(avgDOMContentLoaded),
      avgLoadComplete: Math.round(avgLoadComplete),
      avgResourceCount: Math.round(avgResourceCount),
      avgResourceSize: Math.round(avgResourceSize / 1024), // KB
    }
  }, [performanceMetrics])

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
        <TabsTrigger value="performance">性能指标</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {webVitalsStats.slice(0, 4).map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <CardDescription className="text-xs">{stat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetricValue(stat.name, stat.p75)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.goodPercentage.toFixed(1)}% 良好
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {performanceStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均 TTFB</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceStats.avgTTFB}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均加载时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceStats.avgLoadComplete}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均资源大小</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceStats.avgResourceSize} KB</div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="web-vitals" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals 趋势</CardTitle>
            <CardDescription>最近 7 天的性能指标变化</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="LCP" stroke="#8884d8" name="LCP" />
                <Line type="monotone" dataKey="FID" stroke="#82ca9d" name="FID" />
                <Line type="monotone" dataKey="CLS" stroke="#ffc658" name="CLS" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {webVitalsStats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader>
                <CardTitle>{stat.name}</CardTitle>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">平均值:</span>
                  <span className="font-medium">{formatMetricValue(stat.name, stat.avg)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P75:</span>
                  <span className="font-medium">{formatMetricValue(stat.name, stat.p75)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P95:</span>
                  <span className="font-medium">{formatMetricValue(stat.name, stat.p95)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">样本数:</span>
                  <span className="font-medium">{stat.count}</span>
                </div>
                <div className="mt-4">
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">良好: {stat.ratings.good}</span>
                    <span className="text-yellow-600">需改进: {stat.ratings.needsImprovement}</span>
                    <span className="text-red-600">差: {stat.ratings.poor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>页面加载性能</CardTitle>
            <CardDescription>各项加载时间指标</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceStats && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">TTFB</p>
                    <p className="text-2xl font-bold">{performanceStats.avgTTFB}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">DOM Content Loaded</p>
                    <p className="text-2xl font-bold">{performanceStats.avgDOMContentLoaded}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Load Complete</p>
                    <p className="text-2xl font-bold">{performanceStats.avgLoadComplete}ms</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">平均资源数量</p>
                    <p className="text-2xl font-bold">{performanceStats.avgResourceCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">平均资源大小</p>
                    <p className="text-2xl font-bold">{performanceStats.avgResourceSize} KB</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
