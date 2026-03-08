# 环境变量管理指南

本文档详细说明了 AI-Dating 项目的环境变量配置和管理策略。

## 目录

- [环境变量概述](#环境变量概述)
- [必需的环境变量](#必需的环境变量)
- [可选的环境变量](#可选的环境变量)
- [环境配置](#环境配置)
- [安全最佳实践](#安全最佳实践)
- [故障排查](#故障排查)

---

## 环境变量概述

AI-Dating 使用环境变量来管理不同环境的配置，确保敏感信息不被提交到代码仓库。

### 环境变量文件

```
.env.local          # 本地开发环境（不提交到 Git）
.env.development    # 开发环境配置（不提交到 Git）
.env.staging        # Staging 环境配置（不提交到 Git）
.env.production     # 生产环境配置（不提交到 Git）
.env.example        # 环境变量模板（提交到 Git）
```

### 优先级

```
.env.local > .env.production > .env.development > .env
```

---

## 必需的环境变量

### 1. Supabase 配置

```bash
# Supabase URL（公开）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase 匿名密钥（公开）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase 服务角色密钥（私密，仅服务器端使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**获取方式**:
1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 Settings > API
4. 复制 URL 和 Keys

### 2. Cloudflare R2 配置

```bash
# R2 端点
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com

# R2 访问密钥 ID
R2_ACCESS_KEY_ID=xxxxx

# R2 访问密钥
R2_SECRET_ACCESS_KEY=xxxxx

# R2 存储桶名称
R2_BUCKET_NAME=ai-dating-uploads

# R2 公共 URL
R2_PUBLIC_URL=https://uploads.aidating.com
```

**获取方式**:
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 Object Storage
3. 创建 API Token
4. 复制 Access Key ID 和 Secret Access Key

### 3. 应用配置

```bash
# 应用 URL（公开）
NEXT_PUBLIC_APP_URL=https://aidating.com

# Node 环境
NODE_ENV=production

# 应用名称（公开）
NEXT_PUBLIC_APP_NAME=AI Dating
```

---

## 可选的环境变量

### 1. 分析和监控

```bash
# Google Analytics ID（公开）
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry DSN（公开）
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Sentry Auth Token（私密）
SENTRY_AUTH_TOKEN=xxxxx
```

### 2. 内容审核

```bash
# 腾讯云 Secret ID（私密）
TENCENT_SECRET_ID=xxxxx

# 腾讯云 Secret Key（私密）
TENCENT_SECRET_KEY=xxxxx
```

### 3. 邮件服务

```bash
# SMTP 配置（私密）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@aidating.com
SMTP_PASSWORD=xxxxx
SMTP_FROM=AI Dating <noreply@aidating.com>
```

### 4. CDN 配置

```bash
# CDN URL（公开）
NEXT_PUBLIC_CDN_URL=https://cdn.aidating.com

# Asset Prefix（公开）
NEXT_PUBLIC_ASSET_PREFIX=https://cdn.aidating.com
```

### 5. 功能开关

```bash
# 启用分析功能（公开）
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# 启用内容审核（公开）
NEXT_PUBLIC_ENABLE_CONTENT_MODERATION=true

# 启用支付功能（公开）
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# 启用调试模式（公开）
NEXT_PUBLIC_DEBUG_MODE=false
```

---

## 环境配置

### 本地开发环境

创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

`.env.local` 示例：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Cloudflare R2
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=ai-dating-uploads-dev
R2_PUBLIC_URL=http://localhost:3000/uploads

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# 调试模式
NEXT_PUBLIC_DEBUG_MODE=true
```

### Vercel 部署配置

#### 方法 1: 使用 Vercel Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/)
2. 选择你的项目
3. 进入 Settings > Environment Variables
4. 添加环境变量

#### 方法 2: 使用 Vercel CLI

```bash
# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# 拉取环境变量到本地
vercel env pull .env.local

# 列出所有环境变量
vercel env ls
```

#### 方法 3: 使用 vercel.json

创建 `vercel.json` 文件（不要提交敏感信息）：

```json
{
  "env": {
    "NEXT_PUBLIC_APP_NAME": "AI Dating",
    "NEXT_PUBLIC_ENABLE_ANALYTICS": "true"
  }
}
```

### 多环境配置

为不同环境配置不同的变量：

| 变量 | Development | Staging | Production |
|-----|------------|---------|------------|
| NEXT_PUBLIC_APP_URL | http://localhost:3000 | https://staging.aidating.com | https://aidating.com |
| R2_BUCKET_NAME | ai-dating-uploads-dev | ai-dating-uploads-staging | ai-dating-uploads |
| NEXT_PUBLIC_DEBUG_MODE | true | true | false |
| NODE_ENV | development | production | production |

---

## 安全最佳实践

### 1. 不要提交敏感信息

确保 `.gitignore` 包含：

```gitignore
# 环境变量
.env
.env.local
.env.development
.env.staging
.env.production
.env.*.local

# Vercel
.vercel
```

### 2. 使用环境变量前缀

Next.js 约定：

- `NEXT_PUBLIC_*`: 暴露给浏览器（公开）
- 无前缀: 仅在服务器端可用（私密）

```typescript
// ✅ 正确：服务器端使用私密变量
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ❌ 错误：不要在客户端使用私密变量
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
```

### 3. 验证环境变量

创建 `lib/utils/env.ts` 验证环境变量：

```typescript
/**
 * 验证必需的环境变量
 */
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'R2_ENDPOINT',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// 在应用启动时验证
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}
```

### 4. 使用密钥管理服务

对于生产环境，考虑使用：

- **Vercel Environment Variables**: 内置加密存储
- **AWS Secrets Manager**: 企业级密钥管理
- **HashiCorp Vault**: 开源密钥管理

### 5. 定期轮换密钥

建议每 90 天轮换一次敏感密钥：

```bash
# 1. 生成新的 API Key
# 2. 在 Vercel 中更新环境变量
# 3. 重新部署应用
# 4. 验证新密钥工作正常
# 5. 撤销旧密钥
```

### 6. 限制访问权限

- 只有必要的团队成员可以访问生产环境变量
- 使用 Vercel 的团队权限管理
- 记录所有环境变量的更改

---

## 环境变量使用示例

### 在服务器组件中使用

```typescript
// app/page.tsx
export default async function HomePage() {
  // 服务器端可以访问所有环境变量
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL;

  // ...
}
```

### 在客户端组件中使用

```typescript
// components/analytics.tsx
'use client';

export function Analytics() {
  // 客户端只能访问 NEXT_PUBLIC_* 变量
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // ❌ 这会返回 undefined
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // ...
}
```

### 在 API 路由中使用

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // API 路由可以访问所有环境变量
  const r2Config = {
    endpoint: process.env.R2_ENDPOINT!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  };

  // ...
}
```

### 在配置文件中使用

```typescript
// lib/config/r2.ts
export const r2Config = {
  endpoint: process.env.R2_ENDPOINT!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucket: process.env.R2_BUCKET_NAME!,
  publicUrl: process.env.R2_PUBLIC_URL!,
};

// 验证配置
if (!r2Config.endpoint) {
  throw new Error('R2_ENDPOINT is not configured');
}
```

---

## 故障排查

### Q1: 环境变量未生效

**A**: 检查以下几点：

1. 变量名是否正确（区分大小写）
2. 是否重启了开发服务器
3. 是否在正确的环境中配置
4. 客户端变量是否有 `NEXT_PUBLIC_` 前缀

```bash
# 重启开发服务器
npm run dev
```

### Q2: 客户端无法访问环境变量

**A**: 确保变量名以 `NEXT_PUBLIC_` 开头：

```bash
# ❌ 错误
SUPABASE_URL=https://xxx.supabase.co

# ✅ 正确
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### Q3: 部署后环境变量不同步

**A**: 在 Vercel 中更新环境变量后需要重新部署：

```bash
# 触发重新部署
vercel --prod
```

### Q4: 环境变量包含特殊字符

**A**: 使用引号包裹：

```bash
# ❌ 错误
DATABASE_URL=postgresql://user:p@ss@host/db

# ✅ 正确
DATABASE_URL="postgresql://user:p@ss@host/db"
```

### Q5: 如何调试环境变量

**A**: 创建调试端点（仅在开发环境）：

```typescript
// app/api/debug/env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    // 不要暴露敏感信息
    HAS_SUPABASE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    HAS_R2_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
  });
}
```

---

## 环境变量检查清单

### 开发环境

- [ ] `.env.local` 已创建
- [ ] 所有必需变量已配置
- [ ] 开发服务器已重启
- [ ] 变量可以正常访问

### Staging 环境

- [ ] Vercel 中已配置 staging 环境变量
- [ ] 数据库指向 staging 数据库
- [ ] R2 存储桶使用 staging 桶
- [ ] 调试模式已启用

### 生产环境

- [ ] Vercel 中已配置 production 环境变量
- [ ] 所有敏感信息已加密存储
- [ ] 调试模式已禁用
- [ ] 变量已验证
- [ ] 访问权限已限制

---

## 相关文档

- [部署流程指南](./deployment-guide.md)
- [CDN 配置指南](./cdn-configuration.md)
- [安全最佳实践](../security/best-practices.md)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)

---

**最后更新**: 2026-03-08
**维护者**: DevOps Team