# 监控和回滚指南

本文档详细说明了 AI-Dating 项目的监控策略和回滚机制。

## 目录

- [监控概述](#监控概述)
- [健康检查](#健康检查)
- [性能监控](#性能监控)
- [错误监控](#错误监控)
- [日志管理](#日志管理)
- [告警配置](#告警配置)
- [回滚机制](#回滚机制)

---

## 监控概述

AI-Dating 使用多层监控策略确保应用的稳定性和性能。

### 监控层级

```
应用层监控 (Sentry, Vercel Analytics)
    ↓
性能监控 (Web Vitals, Lighthouse)
    ↓
基础设施监控 (Vercel, Cloudflare)
    ↓
数据库监控 (Supabase)
```

---

## 健康检查

### 1. 健康检查端点

AI-Dating 提供 `/api/health` 端点用于健康检查。

#### 端点详情

```
GET /api/health
```

#### 响应示例

**健康状态**:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-08T10:00:00.000Z",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "50ms"
    },
    "api": {
      "status": "healthy"
    }
  },
  "version": "abc1234",
  "environment": "production"
}
```

**不健康状态**:

```json
{
  "status": "unhealthy",
  "timestamp": "2026-03-08T10:00:00.000Z",
  "checks": {
    "database": {
      "status": "unhealthy",
      "responseTime": "5000ms",
      "error": "Connection timeout"
    },
    "api": {
      "status": "healthy"
    }
  },
  "version": "abc1234",
  "environment": "production"
}
```

### 2. 自动健康检查

#### 使用 Vercel Monitoring

Vercel 自动监控部署的健康状态：

1. 进入 Vercel Dashboard
2. 选择项目
3. 查看 Monitoring 标签

#### 使用外部监控服务

**UptimeRobot** (免费):

1. 注册 [UptimeRobot](https://uptimerobot.com/)
2. 添加新监控
3. 类型: HTTP(s)
4. URL: `https://aidating.com/api/health`
5. 监控间隔: 5 分钟

**Pingdom**:

1. 注册 [Pingdom](https://www.pingdom.com/)
2. 创建 Uptime Check
3. URL: `https://aidating.com/api/health`
4. 检查间隔: 1 分钟

### 3. 健康检查脚本

创建自动化健康检查脚本：

```bash
#!/bin/bash
# scripts/health-check.sh

URL="${1:-https://aidating.com}"
HEALTH_URL="$URL/api/health"

echo "Checking health at: $HEALTH_URL"

RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Health check passed"
  echo "$BODY" | jq '.'
  exit 0
else
  echo "❌ Health check failed (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi
```

使用方式：

```bash
# 检查生产环境
./scripts/health-check.sh https://aidating.com

# 检查 staging 环境
./scripts/health-check.sh https://staging.aidating.com
```

---

## 性能监控

### 1. Web Vitals 监控

AI-Dating 使用 `web-vitals` 库监控核心性能指标。

#### 集成 Web Vitals

已在 `app/layout.tsx` 中集成：

```typescript
import { Analytics } from '@/components/analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### 监控指标

| 指标 | 目标值 | 说明 |
|-----|-------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 最大内容绘制时间 |
| FID (First Input Delay) | < 100ms | 首次输入延迟 |
| CLS (Cumulative Layout Shift) | < 0.1 | 累积布局偏移 |
| TTFB (Time to First Byte) | < 600ms | 首字节时间 |
| FCP (First Contentful Paint) | < 1.8s | 首次内容绘制 |

### 2. Vercel Analytics

Vercel 提供内置的性能分析：

1. 进入 Vercel Dashboard
2. 选择项目
3. 查看 Analytics 标签
4. 查看以下指标：
   - Real Experience Score
   - Web Vitals
   - 页面访问量
   - 地理分布

### 3. Lighthouse CI

在 CI/CD 中集成 Lighthouse：

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## 错误监控

### 1. Sentry 集成

#### 安装 Sentry

```bash
npm install @sentry/nextjs
```

#### 配置 Sentry

创建 `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

创建 `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 1.0,
  debug: false,
});
```

#### 错误捕获

```typescript
try {
  // 可能出错的代码
  await riskyOperation();
} catch (error) {
  // 记录错误到 Sentry
  Sentry.captureException(error, {
    tags: {
      section: 'upload',
    },
    extra: {
      userId: user.id,
    },
  });

  throw error;
}
```

### 2. 错误边界

创建全局错误边界：

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 3. 错误告警

在 Sentry 中配置告警规则：

1. 进入 Sentry 项目设置
2. 选择 Alerts
3. 创建新规则：
   - 错误率超过 1% → 发送邮件
   - 新错误出现 → 发送 Slack 通知
   - 错误数超过 100/小时 → 发送紧急通知

---

## 日志管理

### 1. 结构化日志

创建日志工具 `lib/utils/logger.ts`:

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  },

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  },

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  },

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      this.log('debug', message, context);
    }
  },

  log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // 在生产环境发送到日志服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到 Vercel Logs 或其他日志服务
      console.log(JSON.stringify(logData));
    } else {
      // 开发环境使用友好的格式
      console[level](message, context);
    }
  },
};
```

使用示例：

```typescript
import { logger } from '@/lib/utils/logger';

// 记录信息
logger.info('User logged in', { userId: user.id });

// 记录警告
logger.warn('Rate limit approaching', { userId: user.id, requests: 95 });

// 记录错误
logger.error('Upload failed', { userId: user.id, error: error.message });
```

### 2. Vercel Logs

查看 Vercel 日志：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 查看实时日志
vercel logs --follow

# 查看特定部署的日志
vercel logs [deployment-url]

# 过滤日志
vercel logs --filter="error"
```

### 3. 日志聚合

对于大规模应用，考虑使用日志聚合服务：

- **Logtail**: 简单易用，免费额度充足
- **Datadog**: 企业级监控和日志
- **New Relic**: 全栈监控

---

## 告警配置

### 1. 告警规则

配置以下告警规则：

#### 可用性告警

- 健康检查失败 → 立即通知
- 5xx 错误率 > 1% → 5 分钟内通知
- 响应时间 > 3s → 10 分钟内通知

#### 性能告警

- LCP > 4s → 15 分钟内通知
- FID > 300ms → 15 分钟内通知
- CLS > 0.25 → 15 分钟内通知

#### 业务告警

- 注册失败率 > 5% → 10 分钟内通知
- 上传失败率 > 10% → 10 分钟内通知
- 支付失败率 > 2% → 立即通知

### 2. 通知渠道

配置多个通知渠道：

#### Email

```bash
# 在 Vercel 中配置
Settings > Notifications > Email
```

#### Slack

```bash
# 创建 Slack Webhook
# 在 Vercel 中配置
Settings > Integrations > Slack
```

#### PagerDuty（紧急情况）

```bash
# 创建 PagerDuty 集成
# 配置升级策略
```

### 3. 告警升级

定义告警升级策略：

```
Level 1 (Info): Slack 通知
    ↓ (5 分钟未解决)
Level 2 (Warning): Email + Slack
    ↓ (15 分钟未解决)
Level 3 (Critical): PagerDuty + 电话
```

---

## 回滚机制

### 1. 快速回滚

#### 使用 Vercel Dashboard

1. 登录 Vercel Dashboard
2. 进入项目页面
3. 点击 Deployments
4. 找到上一个稳定版本
5. 点击三个点 → Promote to Production
6. 确认回滚

**回滚时间**: < 1 分钟

#### 使用 Vercel CLI

```bash
# 列出最近的部署
vercel ls

# 回滚到指定部署
vercel rollback [deployment-url]

# 或者使用部署 ID
vercel rollback dpl_xxx
```

### 2. Git 回滚

#### 回滚单个 Commit

```bash
# 回滚最后一个 commit
git revert HEAD

# 推送到远程
git push origin main

# 触发自动部署
```

#### 回滚到指定版本

```bash
# 回滚到指定 commit
git revert <commit-hash>

# 或者创建新分支
git checkout -b hotfix/<issue>
git revert <commit-hash>
git push origin hotfix/<issue>

# 创建 PR 并合并
```

### 3. 数据库回滚

#### 备份策略

Supabase 自动备份：

- 每日备份（保留 7 天）
- 每周备份（保留 4 周）
- 每月备份（保留 3 个月）

#### 回滚步骤

1. 登录 Supabase Dashboard
2. 进入 Database > Backups
3. 选择备份点
4. 点击 Restore
5. 确认回滚

**注意**: 数据库回滚会丢失回滚点之后的所有数据。

### 4. 回滚检查清单

执行回滚前检查：

- [ ] 确认回滚版本是稳定的
- [ ] 通知团队成员
- [ ] 记录回滚原因
- [ ] 准备回滚计划
- [ ] 备份当前数据（如需要）

执行回滚后验证：

- [ ] 健康检查通过
- [ ] 关键功能正常
- [ ] 错误率下降
- [ ] 性能指标正常
- [ ] 用户反馈正常

### 5. 回滚后处理

1. **根因分析**
   - 分析导致回滚的原因
   - 记录到事故报告
   - 制定预防措施

2. **修复问题**
   - 在开发环境修复问题
   - 编写测试用例
   - 在 staging 环境验证

3. **重新部署**
   - 确保问题已修复
   - 通过所有测试
   - 逐步部署到生产

---

## 监控仪表板

### 1. 创建自定义仪表板

使用 Grafana 或 Datadog 创建监控仪表板：

#### 关键指标

- 请求数 (RPS)
- 响应时间 (P50, P95, P99)
- 错误率
- 可用性
- Web Vitals
- 数据库连接数
- 缓存命中率

### 2. 实时监控

```bash
# 使用 Vercel CLI 实时监控
vercel logs --follow

# 过滤错误日志
vercel logs --follow | grep "ERROR"

# 监控特定路由
vercel logs --follow | grep "/api/upload"
```

---

## 最佳实践

### 1. 监控策略

- 监控关键业务指标，不仅仅是技术指标
- 设置合理的告警阈值，避免告警疲劳
- 定期审查和调整监控规则
- 使用多层监控，避免单点故障

### 2. 回滚策略

- 保持回滚简单快速
- 自动化回滚流程
- 定期演练回滚流程
- 记录所有回滚操作

### 3. 事故响应

- 建立事故响应流程
- 明确责任人和升级路径
- 保持沟通渠道畅通
- 事后进行复盘

---

## 相关文档

- [部署流程指南](./deployment-guide.md)
- [CDN 配置指南](./cdn-configuration.md)
- [环境变量管理](./environment-variables.md)
- [故障排查指南](./troubleshooting.md)

---

**最后更新**: 2026-03-08
**维护者**: DevOps Team