# Phase 4 性能优化部署清单

## 📋 部署前检查

### 1. 依赖安装
- [ ] 运行 `npm install @upstash/redis`
- [ ] 检查 package.json 中是否包含 @upstash/redis

### 2. 环境变量配置
- [ ] 注册 Upstash Redis 账号
- [ ] 创建 Redis 数据库
- [ ] 复制 UPSTASH_REDIS_REST_URL 到 .env.local
- [ ] 复制 UPSTASH_REDIS_REST_TOKEN 到 .env.local
- [ ] （可选）配置 VAPID 密钥用于推送通知

### 3. 数据库迁移
- [ ] 在 Supabase Dashboard 执行 `028_create_slow_query_logs.sql`
- [ ] 在 Supabase Dashboard 执行 `029_create_api_metrics.sql`
- [ ] 验证表创建成功

### 4. PWA 资源
- [ ] 创建 /public/icons/ 目录
- [ ] 生成所需尺寸的图标（72x72 到 512x512）
- [ ] 验证 manifest.json 配置正确
- [ ] 验证 sw.js 可访问

### 5. 代码集成
- [ ] 在根布局注册 Service Worker
- [ ] 在根布局初始化资源预加载
- [ ] 更新 API 路由使用缓存中间件
- [ ] 更新数据库查询使用缓存

---

## 🚀 部署步骤

### Step 1: 安装依赖
```bash
npm install @upstash/redis
```

### Step 2: 配置 Redis
1. 访问 https://console.upstash.com/
2. 创建新的 Redis 数据库
3. 复制凭证到 .env.local

### Step 3: 运行迁移
在 Supabase Dashboard > SQL Editor 中执行：
```sql
-- 执行 028_create_slow_query_logs.sql
-- 执行 029_create_api_metrics.sql
```

### Step 4: 生成 PWA 图标
使用工具生成图标：https://realfavicongenerator.net/

### Step 5: 更新代码

#### 根布局 (app/layout.tsx)
```typescript
'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/pwa/register'
import { initResourcePreloading } from '@/lib/optimization/preload'

export default function RootLayout({ children }) {
  useEffect(() => {
    registerServiceWorker()
    initResourcePreloading()
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
```

#### API 路由示例
```typescript
import { withApiCache } from '@/lib/cache/middleware'
import { withApiMetrics } from '@/lib/monitoring/api-metrics'

export const GET = withApiMetrics(
  withApiCache(async (req) => {
    // 处理逻辑
  })
)
```

### Step 6: 测试

#### 测试 Redis 连接
```bash
npx tsx -e "import { getCacheStats } from './lib/cache/redis'; getCacheStats().then(console.log)"
```

#### 测试 Service Worker
1. 打开 Chrome DevTools
2. Application > Service Workers
3. 验证 Service Worker 已注册

#### 测试性能
```bash
npx tsx scripts/performance-test.ts
```

### Step 7: 部署到生产环境
```bash
# 构建
npm run build

# 部署到 Vercel
vercel --prod
```

---

## ✅ 部署后验证

### 1. Redis 缓存
- [ ] 访问任意 API 端点
- [ ] 检查响应头中的 X-Cache: HIT/MISS
- [ ] 第二次访问应该显示 HIT

### 2. Service Worker
- [ ] 打开网站
- [ ] 检查 DevTools > Application > Service Workers
- [ ] 状态应该是 "activated and is running"

### 3. 离线模式
- [ ] 打开网站
- [ ] 断开网络
- [ ] 刷新页面
- [ ] 应该显示离线页面

### 4. PWA 安装
- [ ] 在 Chrome 地址栏应该显示安装图标
- [ ] 点击安装
- [ ] 应用应该添加到主屏幕

### 5. 性能监控
- [ ] 访问 /api/admin/performance
- [ ] 应该返回性能统计数据
- [ ] 检查慢查询日志表

### 6. 图片优化
- [ ] 检查页面中的图片
- [ ] 应该使用 next/image 组件
- [ ] 图片应该懒加载

### 7. 代码分割
- [ ] 打开 DevTools > Network
- [ ] 导航到不同页面
- [ ] 应该看到按需加载的 JS 文件

---

## 📊 性能测试

### Lighthouse 测试
```bash
npx lighthouse https://your-domain.com --view
```

目标分数：
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90
- PWA: > 90

### WebPageTest
访问 https://www.webpagetest.org/
输入网站 URL 进行测试

目标指标：
- TTFB: < 600ms
- FCP: < 1.8s
- LCP: < 2.5s
- CLS: < 0.1

### 缓存命中率
监控 Redis 缓存命中率：
```typescript
import { getCacheStats } from '@/lib/cache/redis'
const stats = await getCacheStats()
```

目标：> 60% 命中率

---

## 🔍 监控和维护

### 日常监控
- [ ] 每天检查 Redis 使用量
- [ ] 每周检查慢查询日志
- [ ] 每周检查 API 性能指标
- [ ] 每月检查缓存命中率

### 定期优化
- [ ] 每月调整 TTL 配置
- [ ] 每月优化慢查询
- [ ] 每季度审查性能预算
- [ ] 每季度更新 Service Worker

### 告警设置
建议设置以下告警：
- Redis 使用量 > 80%
- 慢查询数量 > 100/天
- API 响应时间 > 2s
- 缓存命中率 < 50%

---

## 🐛 常见问题排查

### Redis 连接失败
1. 检查环境变量是否正确
2. 检查 Upstash 数据库状态
3. 检查网络连接

### Service Worker 未注册
1. 检查是否在 HTTPS 环境
2. 检查 sw.js 文件是否可访问
3. 检查浏览器控制台错误

### 缓存未生效
1. 检查 Redis 连接
2. 检查缓存键是否正确
3. 检查 TTL 配置

### 性能未提升
1. 检查缓存命中率
2. 检查慢查询日志
3. 运行 Lighthouse 测试
4. 检查 CDN 配置

---

## 📈 预期效果

### 性能提升
- 响应时间减少 60-80%（缓存命中时）
- 服务器负载减少 50-70%
- 首次内容绘制提升 20-30%
- 最大内容绘制提升 30-40%

### 用户体验
- 页面加载更快
- 离线可访问
- 可安装到主屏幕
- 推送通知支持

### 成本节省
- 数据库查询减少 70-90%
- 带宽使用减少 40-60%
- 服务器资源使用减少 50%

---

## 📚 相关文档

- [性能优化实施报告](./performance-optimization-report.md)
- [Redis 缓存快速配置](./redis-cache-quickstart.md)
- [PWA 快速配置](./pwa-quickstart.md)
- [使用示例](../examples/performance-optimization-usage.tsx)

---

## ✨ 完成标志

当以下所有项目都完成时，Phase 4 性能优化部署完成：

- [x] 依赖安装完成
- [x] 环境变量配置完成
- [x] 数据库迁移完成
- [x] PWA 资源准备完成
- [x] 代码集成完成
- [x] 测试通过
- [x] 部署到生产环境
- [x] 性能验证通过
- [x] 监控设置完成

---

**部署日期**: ___________
**部署人员**: ___________
**验证人员**: ___________
**状态**: [ ] 待部署 [ ] 部署中 [ ] 已完成
