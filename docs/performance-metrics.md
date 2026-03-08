# 性能指标说明

## 概述

本文档详细说明了 AI-Dating 项目中追踪的所有性能指标，包括 Core Web Vitals 和其他性能指标。

---

## Core Web Vitals

Core Web Vitals 是 Google 定义的三个关键用户体验指标，直接影响 SEO 排名。

### 1. LCP (Largest Contentful Paint)

**定义**: 最大内容绘制时间，测量页面主要内容加载完成的时间。

**测量内容**:
- 图片元素
- 视频元素
- 背景图片
- 文本块

**阈值**:
- 🟢 良好: ≤ 2.5 秒
- 🟡 需改进: 2.5 - 4.0 秒
- 🔴 差: > 4.0 秒

**优化建议**:
1. 优化图片大小和格式
2. 使用 CDN 加速资源加载
3. 预加载关键资源
4. 减少服务器响应时间
5. 移除阻塞渲染的资源

**示例**:
```tsx
// 优化 LCP
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // 关键！预加载首屏图片
  quality={85}
/>
```

---

### 2. FID (First Input Delay)

**定义**: 首次输入延迟，测量用户首次与页面交互到浏览器响应的时间。

**测量内容**:
- 点击
- 触摸
- 按键

**阈值**:
- 🟢 良好: ≤ 100 毫秒
- 🟡 需改进: 100 - 300 毫秒
- 🔴 差: > 300 毫秒

**优化建议**:
1. 减少 JavaScript 执行时间
2. 代码分割和懒加载
3. 使用 Web Workers
4. 优化第三方脚本
5. 减少主线程工作

**示例**:
```tsx
// 优化 FID
import dynamic from 'next/dynamic'

// 懒加载非关键组件
const HeavyComponent = dynamic(() => import('./heavy'), {
  ssr: false,
})
```

---

### 3. CLS (Cumulative Layout Shift)

**定义**: 累积布局偏移，测量页面视觉稳定性，防止意外的布局移动。

**测量内容**:
- 元素位置变化
- 尺寸变化
- 内容插入

**阈值**:
- 🟢 良好: ≤ 0.1
- 🟡 需改进: 0.1 - 0.25
- 🔴 差: > 0.25

**优化建议**:
1. 为图片和视频设置尺寸
2. 为动态内容预留空间
3. 避免在现有内容上方插入内容
4. 使用 `font-display: swap`
5. 避免动画改变元素尺寸

**示例**:
```tsx
// 优化 CLS
<Image
  src="/image.jpg"
  width={800}  // 必须设置
  height={600} // 必须设置
  alt="Image"
/>

// 为动态内容预留空间
<div style={{ minHeight: '200px' }}>
  <Suspense fallback={<Skeleton />}>
    <DynamicContent />
  </Suspense>
</div>
```

---

## 其他重要指标

### 4. FCP (First Contentful Paint)

**定义**: 首次内容绘制，测量页面首次渲染任何内容的时间。

**测量内容**:
- 文本
- 图片
- SVG
- Canvas

**阈值**:
- 🟢 良好: ≤ 1.8 秒
- 🟡 需改进: 1.8 - 3.0 秒
- 🔴 差: > 3.0 秒

**优化建议**:
1. 减少阻塞渲染的资源
2. 内联关键 CSS
3. 压缩文本资源
4. 使用 HTTP/2
5. 启用文本压缩

---

### 5. TTFB (Time to First Byte)

**定义**: 首字节时间，测量从请求到接收第一个字节的时间。

**测量内容**:
- DNS 查询
- TCP 连接
- TLS 握手
- 服务器处理

**阈值**:
- 🟢 良好: ≤ 800 毫秒
- 🟡 需改进: 800 - 1800 毫秒
- 🔴 差: > 1800 毫秒

**优化建议**:
1. 使用 CDN
2. 启用服务器缓存
3. 优化数据库查询
4. 使用边缘计算
5. 减少重定向

---

### 6. INP (Interaction to Next Paint)

**定义**: 交互到下次绘制，测量页面对用户交互的响应速度。

**测量内容**:
- 点击
- 触摸
- 键盘输入

**阈值**:
- 🟢 良好: ≤ 200 毫秒
- 🟡 需改进: 200 - 500 毫秒
- 🔴 差: > 500 毫秒

**优化建议**:
1. 优化事件处理器
2. 使用防抖和节流
3. 减少主线程工作
4. 使用 `requestIdleCallback`
5. 优化渲染性能

---

## 导航时间指标

### DNS 查询时间

**定义**: DNS 解析域名所需的时间。

**优化建议**:
- 使用 DNS 预解析: `<link rel="dns-prefetch" href="//example.com">`
- 减少域名数量
- 使用可靠的 DNS 服务

---

### TCP 连接时间

**定义**: 建立 TCP 连接所需的时间。

**优化建议**:
- 使用 HTTP/2 或 HTTP/3
- 启用 Keep-Alive
- 使用 CDN 减少距离

---

### 请求时间

**定义**: 发送请求到开始接收响应的时间。

**优化建议**:
- 减少请求大小
- 启用压缩
- 使用缓存

---

### 响应时间

**定义**: 接收完整响应所需的时间。

**优化建议**:
- 压缩响应内容
- 使用流式传输
- 优化服务器性能

---

### DOM 处理时间

**定义**: 解析和构建 DOM 树所需的时间。

**优化建议**:
- 减少 DOM 节点数量
- 简化 HTML 结构
- 延迟加载非关键内容

---

### DOM Content Loaded 时间

**定义**: DOM 完全加载和解析完成的时间。

**优化建议**:
- 减少阻塞脚本
- 使用 `defer` 或 `async`
- 优化关键渲染路径

---

### Load Complete 时间

**定义**: 页面完全加载（包括所有资源）的时间。

**优化建议**:
- 懒加载非关键资源
- 优化图片和视频
- 减少第三方脚本

---

## 资源加载指标

### 资源数量

**定义**: 页面加载的资源总数。

**建议值**: < 50 个

**优化建议**:
- 合并文件
- 使用 CSS Sprites
- 移除未使用的资源

---

### 资源大小

**定义**: 所有资源的总大小。

**建议值**: < 1 MB

**优化建议**:
- 压缩图片
- 启用 Gzip/Brotli
- 代码分割

---

### 按类型分组

**追踪的资源类型**:
- `script`: JavaScript 文件
- `css`: 样式表
- `img`: 图片
- `font`: 字体
- `fetch`: API 请求
- `xmlhttprequest`: XHR 请求
- `other`: 其他资源

---

## 内存使用指标

### 已使用 JS 堆大小

**定义**: JavaScript 当前使用的内存。

**优化建议**:
- 避免内存泄漏
- 及时清理事件监听器
- 使用 WeakMap/WeakSet

---

### 总 JS 堆大小

**定义**: JavaScript 分配的总内存。

**优化建议**:
- 减少全局变量
- 优化数据结构
- 使用对象池

---

### JS 堆大小限制

**定义**: 浏览器允许的最大 JS 堆大小。

**说明**: 通常为 2GB（32 位）或 4GB（64 位）

---

## 性能评级系统

### 评级标准

我们使用三级评级系统：

- 🟢 **良好 (Good)**: 性能优秀，用户体验好
- 🟡 **需改进 (Needs Improvement)**: 性能可接受，但有优化空间
- 🔴 **差 (Poor)**: 性能不佳，需要立即优化

### 评级计算

评级基于以下百分位：

- **良好**: 75% 的用户体验达到良好阈值
- **需改进**: 75% 的用户体验在良好和差之间
- **差**: 25% 的用户体验低于差阈值

---

## 性能目标

### 项目目标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| Lighthouse Score | > 85 | TBD | 待测试 |
| LCP | < 2.5s | TBD | 待测试 |
| FID | < 100ms | TBD | 待测试 |
| CLS | < 0.1 | TBD | 待测试 |
| FCP | < 1.8s | TBD | 待测试 |
| TTFB | < 800ms | TBD | 待测试 |
| INP | < 200ms | TBD | 待测试 |

### 页面加载目标

- **首屏加载**: < 3 秒
- **完整加载**: < 5 秒
- **交互就绪**: < 3.5 秒

---

## 监控和报告

### 数据收集

性能数据自动收集并存储到 Supabase：

- **web_vitals** 表: Core Web Vitals 数据
- **performance_metrics** 表: 详细性能指标

### 查看数据

管理员可以访问性能仪表板：

```
https://your-domain.com/admin/performance
```

### 数据分析

仪表板提供：

- 时间序列趋势图
- 统计摘要（平均值、P75、P95）
- 评级分布
- 页面级性能对比

---

## 性能优化优先级

### P0 (关键)

必须立即优化的指标：

1. LCP > 4.0s
2. CLS > 0.25
3. TTFB > 1.8s

### P1 (重要)

应该尽快优化的指标：

1. FID > 300ms
2. FCP > 3.0s
3. INP > 500ms

### P2 (次要)

可以逐步优化的指标：

1. 资源大小 > 2MB
2. 资源数量 > 100
3. 内存使用过高

---

## 常见问题

### Q: 为什么我的 LCP 很高？

**A**: 可能原因：
1. 首屏图片太大或未优化
2. 服务器响应慢
3. 阻塞渲染的资源
4. 未使用 CDN

### Q: 如何降低 CLS？

**A**: 解决方案：
1. 为所有图片设置尺寸
2. 为动态内容预留空间
3. 避免在现有内容上方插入内容
4. 使用 `font-display: swap`

### Q: FID 和 INP 有什么区别？

**A**:
- **FID**: 只测量首次交互
- **INP**: 测量所有交互，更全面

### Q: 如何提高 Lighthouse 分数？

**A**: 优先优化：
1. Core Web Vitals (LCP, FID, CLS)
2. 可访问性
3. 最佳实践
4. SEO

---

## 参考资源

### 官方文档

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### 工具

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 学习资源

- [web.dev](https://web.dev/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [MDN Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

---

**文档版本**: 1.0
**最后更新**: 2026-03-08
**维护者**: AI-Dating 开发团队
