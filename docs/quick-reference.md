# CDN 和部署优化 - 快速参考

## 🚀 快速命令

### 部署

```bash
# 自动部署（推荐）
git push origin main

# 手动部署
./scripts/deploy.sh production

# Vercel CLI 部署
vercel --prod
```

### 健康检查

```bash
# 本地
./scripts/health-check.sh http://localhost:3000

# 生产
./scripts/health-check.sh https://aidating.com
```

### 回滚

```bash
# 列出部署
vercel ls

# 回滚
vercel rollback [deployment-url]
```

---

## 📋 环境变量（必需）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# 应用
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

---

## 🔗 重要链接

- **健康检查**: `/api/health`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **GitHub Actions**: https://github.com/jobmake77/AI-Dating/actions

---

## 📊 目标指标

| 指标 | 目标 |
|-----|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| 可用性 | > 99.9% |
| 错误率 | < 0.1% |

---

## 📚 文档

- [CDN 配置](./cdn-configuration.md)
- [部署指南](./deployment-guide.md)
- [环境变量](./environment-variables.md)
- [监控回滚](./monitoring-rollback.md)
- [实施报告](./cdn-deployment-optimization-report.md)

---

## ⚡ 故障排查

### 部署失败
1. 检查 GitHub Actions 日志
2. 验证环境变量
3. 检查测试是否通过

### 健康检查失败
1. 检查数据库连接
2. 验证环境变量
3. 查看 Vercel 日志

### 性能问题
1. 检查 CDN 配置
2. 验证缓存策略
3. 使用 Lighthouse 分析

---

**需要帮助？** 查看完整文档或提交 Issue。