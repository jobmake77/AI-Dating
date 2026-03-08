/**
 * 性能优化使用示例
 * 展示如何在实际代码中使用各种优化功能
 */

// ============================================
// 1. API 路由优化示例
// ============================================

// app/api/contents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withApiCache } from '@/lib/cache/middleware'
import { withApiMetrics } from '@/lib/monitoring/api-metrics'
import { createClient } from '@/lib/supabase/server'
import { CACHE_TTL } from '@/lib/cache/redis'

// 组合使用缓存和性能监控
export const GET = withApiMetrics(
  withApiCache(
    async (req: NextRequest) => {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    },
    {
      ttl: CACHE_TTL.DYNAMIC,
      prefix: 'api:contents',
    }
  )
)

// ============================================
// 2. 数据库查询缓存示例
// ============================================

// lib/actions/content.ts
import { createClient } from '@/lib/supabase/server'
import { contentCache } from '@/lib/cache/query'
import { monitorQuery } from '@/lib/monitoring/slow-query'

export async function getContentById(id: string) {
  const supabase = await createClient()

  // 使用查询缓存
  const { data, error, cached } = await contentCache.getContent(supabase, id)

  if (error) {
    throw new Error(error.message)
  }

  console.log(`Content ${id} - 从缓存获取: ${cached}`)

  return data
}

export async function getTrendingContents(limit: number = 10) {
  const supabase = await createClient()

  // 使用慢查询监控
  return await monitorQuery(
    'getTrendingContents',
    async () => {
      const { data, error } = await contentCache.getTrending(supabase, limit)
      if (error) throw error
      return data
    },
    {
      table: 'contents',
      operation: 'select',
      params: { limit },
    }
  )
}

// ============================================
// 3. 自定义缓存示例
// ============================================

// lib/actions/recommendations.ts
import { withCache, CACHE_TTL, buildCacheKey, CACHE_PREFIX } from '@/lib/cache/redis'

export async function getRecommendations(userId: string) {
  const cacheKey = buildCacheKey(CACHE_PREFIX.RECOMMENDATIONS, userId)

  return await withCache(
    cacheKey,
    async () => {
      // 复杂的推荐算法
      const recommendations = await calculateRecommendations(userId)
      return recommendations
    },
    CACHE_TTL.RECOMMENDATIONS
  )
}

async function calculateRecommendations(userId: string) {
  // 实现推荐逻辑
  return []
}

// ============================================
// 4. 缓存失效示例
// ============================================

// lib/actions/content.ts
import { cacheInvalidation } from '@/lib/cache/redis'

export async function updateContent(id: string, updates: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // 更新后立即失效相关缓存
  await cacheInvalidation.invalidateContent(id)

  return data
}

export async function deleteContent(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('contents').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // 删除后失效缓存
  await cacheInvalidation.invalidateContent(id)
}

// ============================================
// 5. 前端组件优化示例
// ============================================

// components/content/content-editor.tsx
'use client'

import { Suspense, lazy } from 'react'
import { TiptapEditor } from '@/lib/dynamic-imports'

export function ContentEditor() {
  return (
    <div>
      <h2>创建内容</h2>
      {/* 编辑器会自动懒加载 */}
      <TiptapEditor
        content=""
        onChange={(content) => console.log(content)}
      />
    </div>
  )
}

// ============================================
// 6. 图片优化示例
// ============================================

// components/content/content-card.tsx
import { OptimizedImage, OptimizedCover } from '@/components/ui/optimized-image'

export function ContentCard({ content }: { content: any }) {
  return (
    <div className="card">
      {/* 自动优化的封面图 */}
      <OptimizedCover
        src={content.cover_image}
        alt={content.title}
        priority={false} // 非首屏内容不优先加载
      />

      <div className="content">
        <h3>{content.title}</h3>

        {/* 自动优化的头像 */}
        <OptimizedImage
          src={content.author.avatar}
          alt={content.author.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
    </div>
  )
}

// ============================================
// 7. 资源预加载示例
// ============================================

// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { initResourcePreloading, smartPreload } from '@/lib/optimization/preload'
import { registerServiceWorker } from '@/lib/pwa/register'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化资源预加载
    initResourcePreloading()

    // 启用智能预加载（鼠标悬停时预加载链接）
    smartPreload()

    // 注册 Service Worker
    registerServiceWorker()
  }, [])

  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  )
}

// ============================================
// 8. 性能监控示例
// ============================================

// app/api/admin/performance/route.ts
import { NextResponse } from 'next/server'
import { getSlowQueryStats } from '@/lib/monitoring/slow-query'
import { getApiMetricsStats } from '@/lib/monitoring/api-metrics'

export async function GET() {
  const [slowQueries, apiMetrics] = await Promise.all([
    getSlowQueryStats(),
    getApiMetricsStats(),
  ])

  return NextResponse.json({
    slowQueries,
    apiMetrics,
  })
}

// ============================================
// 9. 性能预算检查示例
// ============================================

// lib/monitoring/check-performance.ts
import { generateBudgetReport, DEFAULT_PERFORMANCE_BUDGET } from '@/lib/monitoring/performance-budget'

export async function checkPerformance() {
  // 收集实际性能数据
  const metrics = {
    webVitals: {
      LCP: 2300,
      FID: 80,
      CLS: 0.08,
      FCP: 1600,
      TTFB: 500,
    },
    resources: {
      javascript: 280,
      css: 90,
      images: 950,
      fonts: 80,
      total: 1400,
    },
  }

  // 生成预算报告
  const report = generateBudgetReport(metrics, DEFAULT_PERFORMANCE_BUDGET)

  console.log('性能预算报告:')
  console.log(`通过率: ${report.summary.passRate.toFixed(2)}%`)
  console.log(`通过: ${report.summary.passed}/${report.summary.total}`)

  return report
}

// ============================================
// 10. PWA 功能示例
// ============================================

// components/pwa/install-prompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { checkPWAInstallation, showPWAInstallPrompt } from '@/lib/pwa/register'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 检查是否已安装
    const isInstalled = checkPWAInstallation()
    if (!isInstalled) {
      setShowPrompt(true)
      showPWAInstallPrompt()
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="install-prompt">
      <p>安装 AI Dating 应用，获得更好的体验</p>
      <Button onClick={() => (window as any).installPWA()}>
        立即安装
      </Button>
      <Button variant="ghost" onClick={() => setShowPrompt(false)}>
        稍后再说
      </Button>
    </div>
  )
}

// ============================================
// 11. 推送通知示例
// ============================================

// components/notifications/enable-notifications.tsx
'use client'

import { requestNotificationPermission, subscribeToPushNotifications } from '@/lib/pwa/register'
import { Button } from '@/components/ui/button'

export function EnableNotifications() {
  async function handleEnable() {
    const granted = await requestNotificationPermission()

    if (granted) {
      const subscription = await subscribeToPushNotifications()

      if (subscription) {
        // 将订阅信息发送到服务器
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })

        alert('通知已启用')
      }
    } else {
      alert('通知权限被拒绝')
    }
  }

  return (
    <Button onClick={handleEnable}>
      启用推送通知
    </Button>
  )
}

// ============================================
// 12. 完整的页面优化示例
// ============================================

// app/(main)/contents/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { contentCache } from '@/lib/cache/query'
import { OptimizedCover } from '@/components/ui/optimized-image'
import { Skeleton } from '@/components/ui/skeleton'

export const revalidate = 60 // ISR: 每 60 秒重新生成

export default async function ContentsPage() {
  return (
    <div>
      <h1>内容列表</h1>

      {/* 使用 Suspense 实现流式渲染 */}
      <Suspense fallback={<ContentsSkeleton />}>
        <ContentsList />
      </Suspense>
    </div>
  )
}

async function ContentsList() {
  const supabase = await createClient()

  // 使用缓存查询
  const { data: trending } = await contentCache.getTrending(supabase, 10)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trending?.map((content, index) => (
        <div key={content.id} className="card">
          {/* 首屏内容优先加载 */}
          <OptimizedCover
            src={content.cover_image}
            alt={content.title}
            priority={index < 3}
          />
          <h3>{content.title}</h3>
        </div>
      ))}
    </div>
  )
}

function ContentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card">
          <Skeleton className="w-full aspect-video" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
      ))}
    </div>
  )
}
