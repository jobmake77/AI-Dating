# 隐私功能部署检查清单

**项目**: AI-Dating
**日期**: 2026-03-08
**版本**: 1.0

---

## 部署前检查

### 1. 代码审查
- [ ] 所有文件已创建并提交到 Git
- [ ] 代码通过 TypeScript 类型检查
- [ ] 没有 console.log 或调试代码
- [ ] 所有 TODO 注释已处理

### 2. 配置检查
- [ ] 环境变量已设置
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (可选)
- [ ] Supabase 连接正常
- [ ] 数据库迁移文件已准备

### 3. 文档检查
- [ ] 所有文档已创建
- [ ] 联系方式已填写（或标记为待填写）
- [ ] 公司地址已填写（或标记为待填写）
- [ ] 文档版本号正确

---

## 数据库部署

### 1. 备份数据库
```bash
# 在生产环境执行前，先备份数据库
supabase db dump -f backup-$(date +%Y%m%d).sql
```

### 2. 运行迁移
```bash
# 检查迁移文件
cat supabase/migrations/029_add_privacy_features.sql

# 在测试环境运行
supabase db push --db-url $TEST_DATABASE_URL

# 验证表已创建
supabase db diff

# 在生产环境运行
supabase db push
```

### 3. 验证数据库
```sql
-- 检查表是否创建
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_privacy_settings',
  'data_export_requests',
  'account_deletion_requests'
);

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_privacy_settings',
  'data_export_requests',
  'account_deletion_requests'
);

-- 检查策略是否创建
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN (
  'user_privacy_settings',
  'data_export_requests',
  'account_deletion_requests'
);
```

---

## 应用部署

### 1. 构建检查
```bash
# 清理缓存
rm -rf .next

# 构建应用
npm run build

# 检查构建错误
# 确保没有类型错误或构建失败
```

### 2. 本地测试
```bash
# 启动生产模式
npm run start

# 测试所有页面
curl http://localhost:3000/privacy
curl http://localhost:3000/cookies
curl http://localhost:3000/terms
curl http://localhost:3000/settings/privacy
```

### 3. 部署到生产
```bash
# 根据你的部署平台
# Vercel
vercel --prod

# 或其他平台
# ...
```

---

## 功能测试

### 1. Cookie 横幅测试
- [ ] 首次访问显示 Cookie 横幅
- [ ] "接受全部"按钮工作正常
- [ ] "拒绝全部"按钮工作正常
- [ ] "自定义"按钮打开设置对话框
- [ ] Cookie 偏好正确保存到 localStorage
- [ ] 刷新页面后横幅不再显示
- [ ] 移动端显示正常

### 2. 隐私设置测试
- [ ] 页面正常加载（需登录）
- [ ] 所有设置选项显示正常
- [ ] 更新设置成功保存
- [ ] 刷新页面后设置保持
- [ ] 数据库正确更新

### 3. 数据导出测试
- [ ] 点击"导出数据"按钮
- [ ] 显示加载状态
- [ ] 成功下载 JSON 文件
- [ ] JSON 文件包含所有必要数据
- [ ] 数据格式正确
- [ ] 导出请求记录到数据库

### 4. 账户删除测试（使用测试账户）
- [ ] 点击"删除账户"按钮
- [ ] 显示确认对话框
- [ ] 对话框包含警告信息
- [ ] 确认后成功删除
- [ ] 用户数据正确匿名化
- [ ] 内容标记为已删除
- [ ] 删除请求记录到数据库
- [ ] 用户被登出

### 5. 隐私页面测试
- [ ] `/privacy` 页面正常显示
- [ ] `/cookies` 页面正常显示
- [ ] `/terms` 页面正常显示
- [ ] 所有链接正常工作
- [ ] 响应式设计正常
- [ ] SEO 元数据正确

---

## 安全测试

### 1. RLS 策略测试
```sql
-- 以用户 A 身份尝试访问用户 B 的数据
-- 应该返回空或权限错误
SET request.jwt.claim.sub = 'user-a-id';
SELECT * FROM user_privacy_settings WHERE user_id = 'user-b-id';
```

### 2. API 权限测试
- [ ] 用户不能导出他人数据
- [ ] 用户不能删除他人账户
- [ ] 用户不能修改他人隐私设置
- [ ] 未登录用户不能访问隐私设置

### 3. 数据验证测试
- [ ] 输入验证正常工作
- [ ] SQL 注入防护
- [ ] XSS 防护

---

## 性能测试

### 1. 页面加载速度
- [ ] Cookie 横幅不影响首屏加载
- [ ] 隐私设置页面加载 < 2 秒
- [ ] 隐私政策页面加载 < 2 秒

### 2. 数据导出性能
- [ ] 小数据量（< 100 条）导出 < 5 秒
- [ ] 中等数据量（100-1000 条）导出 < 15 秒
- [ ] 大数据量（> 1000 条）导出 < 30 秒

### 3. 账户删除性能
- [ ] 删除操作 < 10 秒
- [ ] 不阻塞其他用户操作

---

## 监控设置

### 1. 错误监控
- [ ] 设置错误日志监控
- [ ] 设置性能监控
- [ ] 设置可用性监控

### 2. 业务指标
- [ ] Cookie 同意率跟踪
- [ ] 数据导出请求跟踪
- [ ] 账户删除请求跟踪
- [ ] 隐私设置使用率跟踪

### 3. 告警设置
- [ ] 数据导出失败告警
- [ ] 账户删除失败告警
- [ ] 数据库错误告警

---

## 合规检查

### 1. GDPR 要求
- [ ] 隐私政策完整且易懂
- [ ] Cookie 政策详细
- [ ] 用户可以访问自己的数据
- [ ] 用户可以导出数据
- [ ] 用户可以删除账户
- [ ] 用户可以控制隐私设置
- [ ] 数据处理有合法基础

### 2. 文档完整性
- [ ] DPO 联系方式（或标记待填写）
- [ ] 公司地址（或标记待填写）
- [ ] 数据保留政策说明
- [ ] 第三方服务列表
- [ ] 用户权利说明

### 3. 技术措施
- [ ] HTTPS 加密
- [ ] 密码哈希
- [ ] RLS 启用
- [ ] 审计日志（部分）

---

## 用户通知

### 1. 现有用户通知
- [ ] 准备邮件通知模板
- [ ] 说明新的隐私功能
- [ ] 提供隐私设置链接
- [ ] 说明如何管理 Cookie

### 2. 网站公告
- [ ] 在网站上发布公告
- [ ] 说明隐私政策更新
- [ ] 提供反馈渠道

---

## 团队培训

### 1. 开发团队
- [ ] 培训如何处理隐私请求
- [ ] 培训如何维护隐私功能
- [ ] 培训数据保护最佳实践

### 2. 客服团队
- [ ] 培训如何回答隐私问题
- [ ] 培训如何处理数据请求
- [ ] 提供常见问题解答

---

## 文档归档

### 1. 技术文档
- [ ] 实现报告已归档
- [ ] API 文档已更新
- [ ] 数据库文档已更新

### 2. 合规文档
- [ ] GDPR 检查清单已归档
- [ ] 隐私政策版本已归档
- [ ] 数据处理记录已创建

---

## 部署后验证

### 1. 立即验证（部署后 1 小时内）
- [ ] 所有页面可访问
- [ ] Cookie 横幅正常显示
- [ ] 隐私设置正常工作
- [ ] 数据导出功能正常
- [ ] 没有 JavaScript 错误
- [ ] 没有 500 错误

### 2. 短期验证（部署后 24 小时内）
- [ ] 监控错误日志
- [ ] 检查用户反馈
- [ ] 验证性能指标
- [ ] 检查数据库负载

### 3. 长期验证（部署后 1 周内）
- [ ] 分析 Cookie 同意率
- [ ] 分析隐私设置使用率
- [ ] 收集用户反馈
- [ ] 优化性能问题

---

## 回滚计划

### 如果出现严重问题

1. **立即回滚**
   ```bash
   # 回滚到上一个版本
   git revert HEAD
   git push

   # 或使用平台回滚功能
   vercel rollback
   ```

2. **数据库回滚**
   ```bash
   # 恢复备份
   psql $DATABASE_URL < backup-YYYYMMDD.sql
   ```

3. **通知用户**
   - 发布公告说明问题
   - 提供预计恢复时间
   - 道歉并说明补救措施

---

## 签署确认

### 部署负责人
- **姓名**: _______________
- **日期**: _______________
- **签名**: _______________

### 技术审查
- **姓名**: _______________
- **日期**: _______________
- **签名**: _______________

### 合规审查
- **姓名**: _______________
- **日期**: _______________
- **签名**: _______________

---

## 附录

### 相关文档
- [实现报告](/docs/privacy/privacy-implementation-report.md)
- [GDPR 检查清单](/docs/privacy/gdpr-checklist.md)
- [测试指南](/docs/privacy/testing-guide.md)
- [快速参考](/docs/privacy/QUICK_REFERENCE.md)

### 联系方式
- **技术支持**: support@ai-dating.com
- **隐私问题**: privacy@ai-dating.com
- **DPO**: dpo@ai-dating.com

---

**文档版本**: 1.0
**最后更新**: 2026-03-08
