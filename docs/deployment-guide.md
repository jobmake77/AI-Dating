# 部署流程指南

本文档详细说明了 AI-Dating 项目的部署流程和最佳实践。

## 目录

- [部署环境](#部署环境)
- [部署前准备](#部署前准备)
- [自动化部署](#自动化部署)
- [手动部署](#手动部署)
- [部署验证](#部署验证)
- [常见问题](#常见问题)

---

## 部署环境

AI-Dating 支持多环境部署：

| 环境 | 分支 | 域名 | 用途 |
|-----|------|------|------|
| Development | develop | dev.aidating.com | 开发测试 |
| Staging | staging | staging.aidating.com | 预发布测试 |
| Production | main | aidating.com | 生产环境 |

---

## 部署前准备

### 1. 环境变量配置

确保以下环境变量已在 Vercel 中配置：

#### 必需的环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Cloudflare R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=ai-dating-uploads
R2_PUBLIC_URL=https://uploads.aidating.com

# 应用配置
NEXT_PUBLIC_APP_URL=https://aidating.com
NODE_ENV=production
```

#### 可选的环境变量

```bash
# 分析和监控
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxx@sentry.io/xxx

# 内容审核
TENCENT_SECRET_ID=xxx
TENCENT_SECRET_KEY=xxx
```

### 2. 数据库迁移

在部署前确保数据库迁移已完成：

```bash
# 检查待执行的迁移
ls supabase/migrations/

# 在 Supabase Dashboard 中执行迁移
# 或使用 Supabase CLI
supabase db push
```

### 3. 依赖检查

```bash
# 检查依赖是否有安全漏洞
npm audit

# 更新依赖（谨慎操作）
npm update

# 检查过时的依赖
npm outdated
```

### 4. 代码质量检查

```bash
# 运行 linter
npm run lint

# 运行单元测试
npm run test:run

# 运行 E2E 测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:coverage
```

---

## 自动化部署

### 使用 GitHub Actions

#### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 2. 触发部署

**自动部署（推荐）**

```bash
# 推送到 main 分支自动触发生产部署
git push origin main

# 推送到 develop 分支自动触发开发环境部署
git push origin develop
```

**手动触发**

1. 进入 GitHub Actions 页面
2. 选择 "Deploy" workflow
3. 点击 "Run workflow"
4. 选择环境（production/staging）
5. 点击 "Run workflow"

#### 3. 监控部署进度

1. 在 GitHub Actions 页面查看部署日志
2. 等待所有步骤完成
3. 检查健康检查是否通过

---

## 手动部署

### 使用部署脚本

```bash
# 部署到生产环境
./scripts/deploy.sh production

# 部署到 staging 环境
./scripts/deploy.sh staging
```

### 使用 Vercel CLI

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署

```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 指定项目
vercel --prod --token=$VERCEL_TOKEN
```

---

## 部署验证

### 1. 健康检查

部署完成后，自动运行健康检查：

```bash
# 检查健康状态
curl https://aidating.com/api/health

# 预期响应
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

### 2. 功能测试

#### 关键功能检查清单

- [ ] 用户注册和登录
- [ ] 内容发布和查看
- [ ] 图片上传
- [ ] 评论和点赞
- [ ] 搜索功能
- [ ] 通知系统
- [ ] 支付功能（如果有）

#### 自动化测试

```bash
# 运行冒烟测试
npm run test:e2e -- --grep "smoke"

# 运行关键路径测试
npm run test:e2e -- --grep "critical"
```

### 3. 性能检查

#### 使用 Lighthouse

```bash
# 安装 Lighthouse CLI
npm install -g lighthouse

# 运行性能测试
lighthouse https://aidating.com --output html --output-path ./lighthouse-report.html
```

#### 目标指标

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

#### 使用 WebPageTest

访问 [WebPageTest](https://www.webpagetest.org/) 进行详细的性能分析。

### 4. 安全检查

```bash
# 检查 HTTPS
curl -I https://aidating.com | grep -i "strict-transport-security"

# 检查安全头
curl -I https://aidating.com | grep -i "x-frame-options"
curl -I https://aidating.com | grep -i "x-content-type-options"
curl -I https://aidating.com | grep -i "content-security-policy"
```

---

## 部署流程图

```
┌─────────────────┐
│  代码推送到 main  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  触发 CI/CD     │
│  - Lint         │
│  - Test         │
│  - Build        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  部署到 Vercel   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  健康检查        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  成功       失败
    │         │
    │         ▼
    │    ┌─────────┐
    │    │  回滚    │
    │    └─────────┘
    │
    ▼
┌─────────────────┐
│  部署完成        │
│  发送通知        │
└─────────────────┘
```

---

## 回滚策略

### 快速回滚

如果部署后发现严重问题，立即回滚：

#### 使用 Vercel Dashboard

1. 登录 Vercel Dashboard
2. 进入项目页面
3. 找到 Deployments 列表
4. 选择上一个稳定版本
5. 点击 "Promote to Production"

#### 使用 Vercel CLI

```bash
# 列出最近的部署
vercel ls

# 回滚到指定版本
vercel rollback [deployment-url]
```

#### 使用 Git

```bash
# 回滚到上一个 commit
git revert HEAD
git push origin main

# 或者回滚到指定 commit
git revert <commit-hash>
git push origin main
```

### 回滚检查清单

- [ ] 确认回滚版本是稳定的
- [ ] 通知团队成员
- [ ] 记录回滚原因
- [ ] 运行健康检查
- [ ] 验证关键功能
- [ ] 更新事故报告

---

## 部署最佳实践

### 1. 渐进式部署

使用 Vercel 的 Preview Deployments 进行渐进式部署：

```bash
# 1. 部署到预览环境
vercel

# 2. 测试预览环境
# 访问预览 URL 进行测试

# 3. 确认无误后部署到生产
vercel --prod
```

### 2. 蓝绿部署

Vercel 自动支持蓝绿部署：

- 新版本部署到新的实例
- 健康检查通过后切换流量
- 旧版本保留一段时间以便回滚

### 3. 金丝雀发布

对于高风险更改，使用金丝雀发布：

1. 部署新版本到 staging
2. 将 10% 流量导向新版本
3. 监控错误率和性能
4. 逐步增加流量比例
5. 最终切换 100% 流量

### 4. 部署时间窗口

选择合适的部署时间：

- **推荐时间**: 工作日 10:00-16:00
- **避免时间**: 周末、节假日、深夜
- **紧急修复**: 任何时间（需要审批）

### 5. 部署通知

配置部署通知：

```yaml
# .github/workflows/deploy.yml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production: ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 常见问题

### Q1: 部署失败，如何排查？

**A**: 按以下步骤排查：

1. 查看 GitHub Actions 日志
2. 检查 Vercel 部署日志
3. 验证环境变量是否正确
4. 检查依赖是否安装成功
5. 验证构建命令是否正确

### Q2: 部署后页面显示 500 错误

**A**: 可能的原因：

1. 环境变量未配置
2. 数据库连接失败
3. API 路由错误
4. 服务器端代码错误

检查 Vercel 的 Function Logs 查看详细错误信息。

### Q3: 静态资源加载失败

**A**: 检查：

1. CDN 配置是否正确
2. CORS 设置是否正确
3. 资源路径是否正确
4. 缓存是否需要清除

### Q4: 数据库迁移失败

**A**:

1. 在 staging 环境先测试迁移
2. 备份生产数据库
3. 使用 Supabase Dashboard 手动执行
4. 检查迁移脚本语法

### Q5: 部署后性能下降

**A**:

1. 检查是否引入了大型依赖
2. 检查是否有 N+1 查询
3. 检查缓存是否生效
4. 使用 Lighthouse 分析性能瓶颈

---

## 部署检查清单

### 部署前

- [ ] 代码已通过 code review
- [ ] 所有测试通过
- [ ] 数据库迁移已准备
- [ ] 环境变量已配置
- [ ] 依赖已更新
- [ ] 文档已更新

### 部署中

- [ ] CI/CD 流程正常运行
- [ ] 构建成功
- [ ] 部署成功
- [ ] 健康检查通过

### 部署后

- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 安全检查通过
- [ ] 监控指标正常
- [ ] 用户反馈正常
- [ ] 部署文档已更新

---

## 相关文档

- [CDN 配置指南](./cdn-configuration.md)
- [环境变量管理](./environment-variables.md)
- [监控和回滚](./monitoring-rollback.md)
- [故障排查指南](./troubleshooting.md)

---

**最后更新**: 2026-03-08
**维护者**: DevOps Team
