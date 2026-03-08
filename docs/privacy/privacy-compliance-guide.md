# 隐私合规指南

**项目**: AI-Dating
**日期**: 2026-03-08
**版本**: 1.0

---

## 目录

1. [概述](#1-概述)
2. [Cookie 管理](#2-cookie-管理)
3. [用户隐私设置](#3-用户隐私设置)
4. [数据导出](#4-数据导出)
5. [账户删除](#5-账户删除)
6. [管理员操作](#6-管理员操作)
7. [开发指南](#7-开发指南)
8. [常见问题](#8-常见问题)

---

## 1. 概述

本指南说明如何使用和维护 AI-Dating 的隐私合规功能。

### 1.1 核心功能

- **Cookie 同意管理**: 符合 GDPR 的 Cookie 同意机制
- **隐私设置**: 用户可控制的隐私选项
- **数据导出**: GDPR 要求的数据可携权
- **账户删除**: GDPR 要求的被遗忘权
- **隐私文档**: 隐私政策、Cookie 政策、服务条款

### 1.2 合规标准

- ✅ GDPR (欧盟通用数据保护条例)
- ✅ ePrivacy Directive (Cookie 法)
- ✅ CCPA (加州消费者隐私法) - 部分支持

---

## 2. Cookie 管理

### 2.1 Cookie 横幅

首次访问网站时，用户会看到 Cookie 同意横幅。

**位置**: 页面底部
**组件**: `/components/privacy/cookie-consent.tsx`

**功能**:
- 接受全部 Cookie
- 拒绝非必要 Cookie
- 自定义 Cookie 偏好

### 2.2 Cookie 分类

#### 必要 Cookie
- **用途**: 网站基本功能
- **状态**: 总是启用
- **示例**: 会话管理、身份验证、CSRF 保护

#### 分析 Cookie
- **用途**: 网站分析和性能监控
- **状态**: 可选
- **示例**: Google Analytics

#### 营销 Cookie
- **用途**: 广告和营销
- **状态**: 可选
- **示例**: 目前未使用

### 2.3 Cookie 存储

用户的 Cookie 偏好存储在 localStorage：

```typescript
// 存储键
localStorage.getItem("cookie-consent")        // "true" 表示已同意
localStorage.getItem("cookie-preferences")    // JSON 格式的偏好
```

### 2.4 Google Analytics 集成

Cookie 同意与 Google Analytics Consent Mode 集成：

```typescript
gtag("consent", "update", {
  analytics_storage: prefs.analytics ? "granted" : "denied",
  ad_storage: prefs.marketing ? "granted" : "denied",
})
```

### 2.5 管理 Cookie 偏好

用户可以随时更改 Cookie 偏好：

1. 访问 `/settings/privacy`
2. 或清除浏览器 localStorage
3. 或使用浏览器设置

---

## 3. 用户隐私设置

### 3.1 访问隐私设置

**路径**: `/settings/privacy`
**要求**: 已登录用户

### 3.2 可用设置

#### 个人资料可见性
- **公开**: 所有人可见
- **仅关注者**: 只有关注者可见
- **私密**: 只有自己可见

#### 显示选项
- **显示邮箱地址**: 在个人资料上显示邮箱
- **显示位置信息**: 在个人资料上显示位置

#### 互动选项
- **允许私信**: 允许其他用户发送私信
- **允许通知**: 接收系统通知

### 3.3 更新设置

```typescript
// 前端调用
import { updateUserPrivacySettings } from "@/lib/actions/privacy"

await updateUserPrivacySettings(userId, {
  profile_visibility: "private",
  show_email: false,
  allow_messages: true,
})
```

### 3.4 数据库表

```sql
-- user_privacy_settings 表
SELECT * FROM user_privacy_settings WHERE user_id = 'xxx';
```

---

## 4. 数据导出

### 4.1 导出用户数据

用户可以导出所有个人数据（GDPR 数据可携权）。

**位置**: `/settings/privacy` > "导出我的数据"

### 4.2 导出内容

导出的 JSON 文件包含：

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "created_at": "..."
  },
  "profile": { ... },
  "contents": [ ... ],
  "comments": [ ... ],
  "likes": [ ... ],
  "follows": [ ... ],
  "communities": [ ... ],
  "events": [ ... ],
  "messages": [ ... ],
  "notifications": [ ... ]
}
```

### 4.3 导出流程

1. 用户点击"导出我的数据"
2. 系统收集所有相关数据
3. 生成 JSON 文件
4. 自动下载到用户设备
5. 记录导出请求到数据库

### 4.4 API 调用

```typescript
import { exportUserData } from "@/lib/actions/privacy"

const result = await exportUserData(userId)
if (result.success) {
  // 下载 result.data
}
```

### 4.5 导出记录

```sql
-- 查看导出记录
SELECT * FROM data_export_requests
WHERE user_id = 'xxx'
ORDER BY requested_at DESC;
```

---

## 5. 账户删除

### 5.1 删除账户

用户可以永久删除账户（GDPR 被遗忘权）。

**位置**: `/settings/privacy` > "删除我的账户"

### 5.2 删除流程

1. 用户点击"删除我的账户"
2. 显示确认对话框（警告不可撤销）
3. 用户确认删除
4. 系统执行软删除和匿名化
5. 用户被登出

### 5.3 软删除机制

账户删除使用软删除 + 匿名化：

```sql
-- 个人资料匿名化
UPDATE profiles SET
  username = 'deleted_user_xxx',
  display_name = '已删除用户',
  bio = NULL,
  avatar_url = NULL,
  deleted_at = NOW()
WHERE id = 'xxx';

-- 内容标记为已删除
UPDATE contents SET
  title = '[已删除]',
  content = '[此内容已被作者删除]',
  deleted_at = NOW()
WHERE author_id = 'xxx';

-- 评论标记为已删除
UPDATE comments SET
  content = '[已删除]',
  deleted_at = NOW()
WHERE user_id = 'xxx';
```

### 5.4 保留的数据

为了审计和合规，以下数据会保留：

- 匿名化的用户记录
- 删除请求记录
- 审计日志
- 必要的关联数据（如交易记录）

### 5.5 API 调用

```typescript
import { requestAccountDeletion } from "@/lib/actions/privacy"

const result = await requestAccountDeletion(userId, "用户主动删除")
if (result.success) {
  // 重定向到登出页面
}
```

### 5.6 删除记录

```sql
-- 查看删除记录
SELECT * FROM account_deletion_requests
WHERE user_id = 'xxx'
ORDER BY requested_at DESC;
```

---

## 6. 管理员操作

### 6.1 查看隐私请求

管理员可以查看所有隐私相关请求。

```sql
-- 数据导出请求
SELECT
  der.*,
  p.username,
  p.email
FROM data_export_requests der
JOIN profiles p ON der.user_id = p.id
ORDER BY der.requested_at DESC;

-- 账户删除请求
SELECT
  adr.*,
  p.username,
  p.email
FROM account_deletion_requests adr
JOIN profiles p ON adr.user_id = p.id
ORDER BY adr.requested_at DESC;
```

### 6.2 处理删除请求

如果需要手动处理删除请求：

```sql
-- 更新删除请求状态
UPDATE account_deletion_requests
SET
  status = 'completed',
  completed_at = NOW()
WHERE id = 'xxx';
```

### 6.3 恢复已删除账户

如果需要恢复误删除的账户（在保留期内）：

```sql
-- 恢复账户
UPDATE profiles
SET deleted_at = NULL
WHERE id = 'xxx' AND deleted_at IS NOT NULL;

-- 恢复内容
UPDATE contents
SET deleted_at = NULL
WHERE author_id = 'xxx' AND deleted_at IS NOT NULL;
```

---

## 7. 开发指南

### 7.1 添加新的数据收集

当添加新的数据收集功能时：

1. **更新隐私政策**: 说明新数据的用途
2. **更新数据导出**: 包含新数据
3. **更新删除逻辑**: 确保新数据被删除
4. **考虑 Cookie**: 是否需要 Cookie 同意

### 7.2 查询活跃用户

使用视图过滤已删除的用户：

```sql
-- 使用视图
SELECT * FROM active_profiles WHERE username = 'xxx';

-- 或手动过滤
SELECT * FROM profiles WHERE deleted_at IS NULL AND username = 'xxx';
```

### 7.3 RLS 策略

确保新表启用 RLS：

```sql
-- 启用 RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);
```

### 7.4 审计日志

对于敏感操作，添加审计日志：

```typescript
// 记录操作
await supabase.from("audit_logs").insert({
  user_id: userId,
  action: "data_export",
  details: { ... },
  ip_address: req.ip,
  user_agent: req.headers["user-agent"],
})
```

---

## 8. 常见问题

### 8.1 Cookie 相关

**Q: Cookie 横幅不显示？**
A: 检查 localStorage 是否已有 `cookie-consent` 键。清除后刷新页面。

**Q: 如何测试不同的 Cookie 偏好？**
A: 清除 localStorage 或使用隐身模式。

**Q: Google Analytics 不工作？**
A: 确保用户已同意分析 Cookie，检查 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 环境变量。

### 8.2 隐私设置相关

**Q: 隐私设置不保存？**
A: 检查用户是否已登录，检查 RLS 策略，查看浏览器控制台错误。

**Q: 如何重置隐私设置？**
A: 删除 `user_privacy_settings` 表中的记录，系统会使用默认值。

### 8.3 数据导出相关

**Q: 导出的数据不完整？**
A: 检查 `exportUserData` 函数，确保包含所有表。

**Q: 导出失败？**
A: 检查数据量是否过大，考虑分批导出或异步处理。

**Q: 导出文件太大？**
A: 考虑压缩 JSON 或提供分批下载。

### 8.4 账户删除相关

**Q: 删除后能恢复吗？**
A: 在保留期内（如 30 天）可以恢复，之后永久删除。

**Q: 删除后内容还显示吗？**
A: 内容会显示为"[已删除]"，但保留用于审计。

**Q: 如何完全删除数据？**
A: 需要管理员手动操作，符合法律要求后才能完全删除。

### 8.5 合规相关

**Q: 如何处理数据泄露？**
A: 参考数据泄露响应流程（待建立），72 小时内通知监管机构。

**Q: 如何响应用户权利请求？**
A: 大部分请求可通过自助功能完成，特殊请求联系 DPO。

**Q: 需要 DPO 吗？**
A: 根据业务规模和数据处理类型决定，建议咨询法律顾问。

---

## 9. 维护清单

### 9.1 每月

- [ ] 审查隐私请求（导出、删除）
- [ ] 检查 Cookie 同意率
- [ ] 监控隐私设置使用情况

### 9.2 每季度

- [ ] 审查隐私政策是否需要更新
- [ ] 检查第三方服务合规性
- [ ] 审查数据保留政策
- [ ] 测试所有隐私功能

### 9.3 每年

- [ ] 全面隐私审计
- [ ] 更新 GDPR 合规检查清单
- [ ] 审查数据处理协议
- [ ] 员工隐私培训

---

## 10. 联系方式

### 隐私问题

- **邮箱**: privacy@ai-dating.com
- **DPO**: dpo@ai-dating.com

### 技术支持

- **邮箱**: support@ai-dating.com
- **文档**: `/docs/privacy/`

---

## 11. 相关资源

### 内部文档

- [隐私实现报告](/docs/privacy/privacy-implementation-report.md)
- [GDPR 合规检查清单](/docs/privacy/gdpr-checklist.md)

### 外部资源

- [GDPR 官方文本](https://gdpr-info.eu/)
- [ICO 指南](https://ico.org.uk/for-organisations/guide-to-data-protection/)
- [Google Analytics Consent Mode](https://support.google.com/analytics/answer/9976101)

---

**文档版本**: 1.0
**最后更新**: 2026-03-08
**维护者**: [待填写]
