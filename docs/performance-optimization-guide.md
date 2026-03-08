# 性能优化指南

## 概述

本指南提供了 AI-Dating 项目的性能优化最佳实践和具体操作步骤。

## 目录

1. [图片优化](#图片优化)
2. [代码优化](#代码优化)
3. [加载优化](#加载优化)
4. [缓存策略](#缓存策略)
5. [监控和分析](#监控和分析)

---

## 图片优化

### 1. 使用 Next.js Image 组件

**始终使用** `next/image` 而不是 `<img>` 标签：

```tsx
// ❌ 不推荐
<img src="/avatar.jpg" alt="Avatar" />

// ✅ 推荐
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  alt="Avatar"
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

### 2. 图片格式选择

Next.js 自动优化图片格式：

- **AVIF**: 最佳压缩率，现代浏览器支持
- **WebP**: 良好压缩率，广泛支持
- **JPEG/PNG**: 降级方案

配置已在 `next.config.js` 中设置：

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
}
```

### 3. 响应式图片

使用 `sizes` 属性优化不同屏幕尺寸：

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority // 首屏图片使用 priority
/>
```

### 4. 图片优化清单

- [ ] 所有图片使用 Next.js Image 组件
- [ ] 设置正确的 width 和 height
- [ ] 首屏图片使用 `priority`
- [ ] 其他图片使用 `loading="lazy"`
- [ ] 使用 `placeholder="blur"` 提升体验
- [ ] 压缩图片源文件（使用 TinyPNG 等工具）

---

## 代码优化

### 1. 组件懒加载

使用 `next/dynamic` 懒加载非关键组件：

```tsx
import dynamic from 'next/dynamic'

// 懒加载组件
const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // 如果不需要 SSR
})

// 使用
<HeavyComponent />
```

### 2. 代码分割

按路由自动分割：

```tsx
// app/dashboard/page.tsx
// 自动分割为独立的 chunk
export default function Dashboard() {
  return <div>Dashboard</div>
}
```

### 3. 减少客户端 JavaScript

优先使用 Server Components：

```tsx
// ✅ Server Component (默认)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ❌ 只在需要交互时使用 Client Component
'use client'
export default function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 4. 优化依赖包

在 `next.config.js` 中配置包优化：

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@supabase/ssr',
    'recharts',
  ],
}
```

### 5. 移除未使用的代码

```bash
# 分析 bundle 大小
npm run build

# 使用 webpack-bundle-analyzer
npm install --save-dev @next/bundle-analyzer
```

---

## 加载优化

### 1. 字体优化

使用 Next.js 字体优化：

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 2. 预加载关键资源

```tsx
<head>
  <link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://api.example.com" />
  <link rel="dns-prefetch" href="https://cdn.example.com" />
</head>
```

### 3. 流式渲染

使用 Suspense 实现流式渲染：

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Page Title</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

### 4. 数据预取

使用 `prefetch` 预取链接：

```tsx
import Link from 'next/link'

// 自动预取（默认行为）
<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>
```

---

## 缓存策略

### 1. 静态生成 (SSG)

对于不常变化的页面：

```tsx
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// 每 60 秒重新验证
export const revalidate = 60
```

### 2. 增量静态再生 (ISR)

```tsx
export const revalidate = 3600 // 1 小时

export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### 3. 客户端缓存

使用 SWR 或 React Query：

```tsx
import useSWR from 'swr'

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return <div>Hello {data.name}!</div>
}
```

### 4. HTTP 缓存

设置正确的缓存头：

```tsx
// app/api/data/route.ts
export async function GET() {
  const data = await fetchData()

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  })
}
```

---

## 监控和分析

### 1. 使用性能仪表板

访问管理员性能仪表板：

```
https://your-domain.com/admin/performance
```

查看：
- Core Web Vitals 指标
- 页面加载时间
- 资源使用情况

### 2. Lighthouse 测试

定期运行 Lighthouse 测试：

```bash
# 安装 Lighthouse CLI
npm install -g lighthouse

# 运行测试
lighthouse https://your-domain.com --view

# 或在 Chrome DevTools 中运行
# DevTools > Lighthouse > Generate report
```

### 3. 开发环境监控

在开发环境中查看性能日志：

```bash
npm run dev

# 打开浏览器控制台
# 查看 [Web Vitals] 和 [Performance Metrics] 日志
```

### 4. 性能预算

设置性能预算，防止性能退化：

```javascript
// next.config.js
module.exports = {
  // 性能预算（示例）
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 244000, // 244 KB
        maxEntrypointSize: 244000,
        hints: 'warning',
      }
    }
    return config
  },
}
```

---

## 性能优化清单

### 关键指标目标

- [ ] Lighthouse Performance Score > 85
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 800ms
- [ ] 首屏加载时间 < 3s

### 图片优化

- [ ] 所有图片使用 Next.js Image
- [ ] 首屏图片使用 priority
- [ ] 其他图片使用 lazy loading
- [ ] 图片压缩和格式优化

### 代码优化

- [ ] 使用 Server Components
- [ ] 懒加载非关键组件
- [ ] 优化依赖包导入
- [ ] 移除未使用的代码

### 加载优化

- [ ] 字体优化
- [ ] 预加载关键资源
- [ ] 使用 Suspense 流式渲染
- [ ] 预取链接

### 缓存策略

- [ ] 静态页面使用 SSG
- [ ] 动态页面使用 ISR
- [ ] API 设置缓存头
- [ ] 客户端数据缓存

### 监控

- [ ] 启用 Web Vitals 追踪
- [ ] 定期查看性能仪表板
- [ ] 运行 Lighthouse 测试
- [ ] 设置性能预算

---

## 常见性能问题和解决方案

### 问题 1: LCP 过高

**原因**:
- 大图片未优化
- 关键资源加载慢
- 服务器响应慢

**解决方案**:
```tsx
// 1. 优化首屏图片
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // 关键！
  quality={85}
/>

// 2. 预加载关键资源
<link rel="preload" href="/critical.css" as="style" />

// 3. 使用 CDN
// 配置 Cloudflare 或其他 CDN
```

### 问题 2: CLS 过高

**原因**:
- 图片没有设置尺寸
- 动态内容插入
- Web 字体加载

**解决方案**:
```tsx
// 1. 始终设置图片尺寸
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Image"
/>

// 2. 为动态内容预留空间
<div style={{ minHeight: '200px' }}>
  <Suspense fallback={<Skeleton />}>
    <DynamicContent />
  </Suspense>
</div>

// 3. 优化字体加载
const font = Inter({
  display: 'swap', // 关键！
  preload: true,
})
```

### 问题 3: FID/INP 过高

**原因**:
- JavaScript 执行时间长
- 主线程阻塞
- 事件处理器过重

**解决方案**:
```tsx
// 1. 使用 Web Workers
const worker = new Worker('/worker.js')

// 2. 防抖和节流
import { useDebouncedCallback } from 'use-debounce'

const handleSearch = useDebouncedCallback((value) => {
  // 搜索逻辑
}, 300)

// 3. 优化事件处理器
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies])
```

### 问题 4: TTFB 过高

**原因**:
- 服务器响应慢
- 数据库查询慢
- 网络延迟

**解决方案**:
```tsx
// 1. 使用缓存
export const revalidate = 60

// 2. 优化数据库查询
const { data } = await supabase
  .from('posts')
  .select('id, title') // 只选择需要的字段
  .limit(10)

// 3. 使用 CDN
// 配置边缘缓存
```

---

## 性能优化工具

### 1. 分析工具

- **Lighthouse**: Chrome DevTools 内置
- **WebPageTest**: https://www.webpagetest.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/

### 2. 监控工具

- **Web Vitals Extension**: Chrome 扩展
- **Performance Monitor**: Chrome DevTools
- **Network Panel**: Chrome DevTools

### 3. 优化工具

- **TinyPNG**: 图片压缩
- **Squoosh**: 图片优化
- **Bundle Analyzer**: 分析包大小

---

## 最佳实践总结

1. **优先优化首屏**: 首屏加载速度最重要
2. **测量再优化**: 先测量，再针对性优化
3. **渐进增强**: 基础功能优先，增强功能后加载
4. **持续监控**: 定期检查性能指标
5. **自动化测试**: 集成 Lighthouse CI

---

## 参考资源

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

---

**文档版本**: 1.0
**最后更新**: 2026-03-08
