# 性能监控快速参考

## 快速开始

### 查看性能数据

**开发环境**:
```bash
npm run dev
# 打开浏览器控制台查看 [Web Vitals] 日志
```

**生产环境**:
```
访问: https://your-domain.com/admin/performance
（仅管理员）
```

---

## 核心指标

### Core Web Vitals

| 指标 | 良好 | 需改进 | 差 | 说明 |
|------|------|--------|-----|------|
| **LCP** | ≤ 2.5s | ≤ 4.0s | > 4.0s | 最大内容绘制 |
| **CLS** | ≤ 0.1 | ≤ 0.25 | > 0.25 | 累积布局偏移 |
| **INP** | ≤ 200ms | ≤ 500ms | > 500ms | 交互到下次绘制 |
| **FCP** | ≤ 1.8s | ≤ 3.0s | > 3.0s | 首次内容绘制 |
| **TTFB** | ≤ 800ms | ≤ 1.8s | > 1.8s | 首字节时间 |

---

## 常见优化

### 优化 LCP (最大内容绘制)

```tsx
// 1. 首屏图片使用 priority
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // 关键！
/>

// 2. 预加载关键资源
<link rel="preload" href="/critical.css" as="style" />
```

### 优化 CLS (累积布局偏移)

```tsx
// 1. 始终设置图片尺寸
<Image
  src="/image.jpg"
  width={800}  // 必须
  height={600} // 必须
  alt="Image"
/>

// 2. 为动态内容预留空间
<div style={{ minHeight: '200px' }}>
  <Suspense fallback={<Skeleton />}>
    <DynamicContent />
  </Suspense>
</div>
```

### 优化 INP (交互响应)

```tsx
// 1. 懒加载非关键组件
const Heavy = dynamic(() => import('./heavy'), {
  ssr: false,
})

// 2. 使用防抖
import { useDebouncedCallback } from 'use-debounce'

const handleSearch = useDebouncedCallback((value) => {
  // 搜索逻辑
}, 300)
```

---

## 性能检查清单

### 图片优化
- [ ] 使用 Next.js Image 组件
- [ ] 首屏图片使用 `priority`
- [ ] 其他图片使用 `loading="lazy"`
- [ ] 设置正确的 width 和 height

### 代码优化
- [ ] 优先使用 Server Components
- [ ] 懒加载非关键组件
- [ ] 优化依赖包导入
- [ ] 移除未使用的代码

### 加载优化
- [ ] 预加载关键资源
- [ ] 使用 Suspense 流式渲染
- [ ] 字体优化（display: swap）
- [ ] 预取链接

---

## 工具和命令

### Lighthouse 测试

```bash
# 安装
npm install -g lighthouse

# 运行测试
lighthouse https://your-domain.com --view

# 或在 Chrome DevTools 中
# DevTools > Lighthouse > Generate report
```

### 构建分析

```bash
# 构建项目
npm run build

# 查看构建输出
# 检查包大小和警告
```

---

## API 端点

### Web Vitals
```
POST /api/analytics/web-vitals
```

### Performance Metrics
```
POST /api/analytics/performance
```

---

## 数据库表

### web_vitals
存储 Core Web Vitals 数据

### performance_metrics
存储详细性能指标

---

## 常见问题

**Q: 为什么看不到性能数据？**
A: 确保已运行数据库迁移，且有足够的访问量

**Q: 如何提高 Lighthouse 分数？**
A: 优先优化 Core Web Vitals (LCP, CLS, INP)

**Q: FID 去哪了？**
A: FID 已被 INP 取代（web-vitals v4+）

---

## 相关文档

- [完整实现报告](./performance-monitoring-implementation.md)
- [优化指南](./performance-optimization-guide.md)
- [指标说明](./performance-metrics.md)

---

**最后更新**: 2026-03-08
