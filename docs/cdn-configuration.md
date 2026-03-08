# CDN 配置指南

本文档详细说明了 AI-Dating 项目的 CDN 配置和优化策略。

## 目录

- [Cloudflare CDN 配置](#cloudflare-cdn-配置)
- [静态资源 CDN 加速](#静态资源-cdn-加速)
- [Cloudflare R2 图片 CDN](#cloudflare-r2-图片-cdn)
- [缓存策略](#缓存策略)
- [性能优化](#性能优化)

---

## Cloudflare CDN 配置

### 1. 域名配置

#### 添加域名到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 "Add a Site"
3. 输入你的域名（例如：`aidating.com`）
4. 选择免费计划（Free Plan）
5. 更新域名的 DNS 服务器到 Cloudflare 提供的服务器

#### DNS 记录配置

```
Type    Name    Content                 Proxy Status    TTL
A       @       76.76.21.21            Proxied         Auto
CNAME   www     aidating.com           Proxied         Auto
CNAME   api     aidating.com           Proxied         Auto
```

### 2. SSL/TLS 配置

#### 启用 HTTPS

1. 进入 SSL/TLS 设置
2. 选择加密模式：**Full (strict)**
3. 启用以下选项：
   - Always Use HTTPS
   - Automatic HTTPS Rewrites
   - Minimum TLS Version: 1.2

#### 配置 SSL 证书

Cloudflare 会自动为你的域名颁发免费的 SSL 证书。

```bash
# 验证 SSL 配置
curl -I https://aidating.com
```

### 3. 页面规则（Page Rules）

创建以下页面规则以优化性能：

#### 规则 1: 静态资源缓存

```
URL: *aidating.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 year
```

#### 规则 2: API 路由不缓存

```
URL: *aidating.com/api/*
Settings:
  - Cache Level: Bypass
```

#### 规则 3: 图片资源缓存

```
URL: *aidating.com/*.{jpg,jpeg,png,gif,webp,svg,ico}
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 week
```

---

## 静态资源 CDN 加速

### Next.js 静态资源配置

Next.js 自动将静态资源放在 `/_next/static/` 路径下，这些资源包括：

- JavaScript bundles
- CSS 文件
- 字体文件
- 图片（通过 `next/image` 优化的）

### 配置 CDN 域名

在 `next.config.ts` 中配置 CDN 域名：

```typescript
const nextConfig: NextConfig = {
  // CDN 配置
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://cdn.aidating.com'
    : '',

  images: {
    domains: [
      'cdn.aidating.com',
      '*.supabase.co',
      '*.r2.dev',
      '*.cloudflare.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### 环境变量配置

在 `.env.production` 中添加：

```bash
# CDN 配置
NEXT_PUBLIC_CDN_URL=https://cdn.aidating.com
NEXT_PUBLIC_ASSET_PREFIX=https://cdn.aidating.com
```

---

## Cloudflare R2 图片 CDN

### 1. R2 存储桶配置

#### 创建 R2 存储桶

1. 登录 Cloudflare Dashboard
2. 进入 R2 Object Storage
3. 创建新存储桶：`ai-dating-uploads`
4. 配置公共访问权限

#### 配置自定义域名

1. 在 R2 存储桶设置中，点击 "Connect Domain"
2. 输入自定义域名：`uploads.aidating.com`
3. Cloudflare 会自动创建 DNS 记录

### 2. 图片上传配置

在 `lib/actions/upload.ts` 中配置 R2：

```typescript
const R2_CONFIG = {
  endpoint: process.env.R2_ENDPOINT!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucket: process.env.R2_BUCKET_NAME!,
  publicUrl: process.env.R2_PUBLIC_URL!, // https://uploads.aidating.com
};
```

### 3. 图片 CDN 优化

#### 使用 Cloudflare Image Resizing

Cloudflare 提供免费的图片调整大小服务：

```typescript
// 生成优化的图片 URL
function getOptimizedImageUrl(
  originalUrl: string,
  width: number,
  quality: number = 85
): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  return `${cdnUrl}/cdn-cgi/image/width=${width},quality=${quality},format=auto/${originalUrl}`;
}

// 使用示例
const avatarUrl = getOptimizedImageUrl(user.avatar, 200);
```

#### 图片格式优化

Cloudflare 会自动将图片转换为最优格式：

- 支持 WebP 的浏览器 → WebP
- 支持 AVIF 的浏览器 → AVIF
- 其他浏览器 → 原始格式

---

## 缓存策略

### 1. 缓存层级

AI-Dating 使用三层缓存策略：

```
Browser Cache → Cloudflare Edge Cache → Origin Server
```

### 2. 缓存配置

#### 静态资源缓存

| 资源类型 | Browser Cache | Edge Cache | 说明 |
|---------|--------------|-----------|------|
| JS/CSS  | 1 year       | 1 year    | 带版本号，可长期缓存 |
| 图片    | 1 week       | 1 month   | 用户上传的图片 |
| 字体    | 1 year       | 1 year    | 字体文件不常变化 |
| HTML    | No cache     | 5 minutes | 动态内容，短期缓存 |
| API     | No cache     | No cache  | 动态数据，不缓存 |

#### Next.js 缓存配置

在 `next.config.ts` 中配置：

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

### 3. 缓存清除

#### 手动清除缓存

```bash
# 使用 Cloudflare API 清除缓存
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

#### 选择性清除

```bash
# 清除特定文件
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://aidating.com/_next/static/chunks/main.js"]}'
```

---

## 性能优化

### 1. 启用 Brotli 压缩

Cloudflare 自动启用 Brotli 压缩，比 Gzip 压缩率更高。

验证压缩：

```bash
curl -H "Accept-Encoding: br" -I https://aidating.com
```

### 2. 启用 HTTP/2 和 HTTP/3

在 Cloudflare Dashboard 中启用：

1. 进入 Network 设置
2. 启用 HTTP/2
3. 启用 HTTP/3 (with QUIC)

### 3. 启用 Early Hints

Early Hints 可以在服务器处理请求时提前发送资源提示：

```typescript
// 在 Next.js 中配置 Early Hints
export const config = {
  runtime: 'edge',
};

export default function handler(req: Request) {
  return new Response('Hello', {
    headers: {
      'Link': '</styles.css>; rel=preload; as=style',
    },
  });
}
```

### 4. 启用 Argo Smart Routing（付费功能）

Argo 可以优化路由，减少延迟 30%：

1. 进入 Traffic 设置
2. 启用 Argo Smart Routing
3. 费用：$5/月 + $0.10/GB

### 5. 性能监控

#### 使用 Cloudflare Analytics

1. 进入 Analytics 面板
2. 查看以下指标：
   - 请求数
   - 带宽使用
   - 缓存命中率
   - 响应时间

#### 目标指标

- 缓存命中率：> 80%
- TTFB (Time to First Byte)：< 200ms
- LCP (Largest Contentful Paint)：< 2.5s
- FID (First Input Delay)：< 100ms
- CLS (Cumulative Layout Shift)：< 0.1

---

## 最佳实践

### 1. 使用版本化的静态资源

Next.js 自动为静态资源添加哈希值：

```
/_next/static/chunks/main-abc123.js
```

这样可以安全地设置长期缓存。

### 2. 优化图片

- 使用 `next/image` 组件
- 启用 WebP/AVIF 格式
- 设置合适的图片尺寸
- 使用懒加载

```tsx
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={200}
  height={200}
  loading="lazy"
  quality={85}
/>
```

### 3. 预加载关键资源

```tsx
import Head from 'next/head';

<Head>
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://uploads.aidating.com" />
  <link rel="dns-prefetch" href="https://api.aidating.com" />
</Head>
```

### 4. 使用 Service Worker 缓存

考虑使用 Workbox 实现离线缓存：

```bash
npm install workbox-webpack-plugin
```

---

## 故障排查

### 缓存未生效

1. 检查 Cache-Control 头
2. 检查 Cloudflare 页面规则
3. 清除浏览器缓存
4. 使用无痕模式测试

### 图片加载慢

1. 检查图片大小（建议 < 500KB）
2. 使用 WebP 格式
3. 启用懒加载
4. 使用 CDN

### CORS 错误

在 R2 存储桶中配置 CORS：

```json
[
  {
    "AllowedOrigins": ["https://aidating.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 相关文档

- [部署流程文档](./deployment-guide.md)
- [环境变量管理](./environment-variables.md)
- [监控和回滚](./monitoring-rollback.md)
- [Cloudflare 官方文档](https://developers.cloudflare.com/)

---

**最后更新**: 2026-03-08
**维护者**: DevOps Team
