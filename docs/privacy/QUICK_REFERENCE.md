# 隐私功能快速参考

## 🚀 快速开始

### 部署
```bash
# 1. 运行数据库迁移
supabase db push

# 2. 启动开发服务器
npm run dev

# 3. 验证功能
./scripts/verify-privacy-features.sh
```

### 测试
```bash
# 清除 Cookie 偏好
localStorage.removeItem('cookie-consent')
localStorage.removeItem('cookie-preferences')

# 刷新页面查看 Cookie 横幅
```

---

## 📁 文件位置

### 组件
- `components/privacy/cookie-consent.tsx` - Cookie 横幅
- `components/privacy/privacy-settings-form.tsx` - 隐私设置表单

### 页面
- `/privacy` → `app/(main)/privacy/page.tsx`
- `/cookies` → `app/(main)/cookies/page.tsx`
- `/terms` → `app/(main)/terms/page.tsx`
- `/settings/privacy` → `app/(main)/(dashboard)/settings/privacy/page.tsx`

### API
- `lib/actions/privacy.ts` - 所有隐私相关操作

### 数据库
- `supabase/migrations/029_add_privacy_features.sql`

---

## 🔧 常用操作

### 导出用户数据
```typescript
import { exportUserData } from "@/lib/actions/privacy"

const result = await exportUserData(userId)
// 返回完整的用户数据 JSON
```

### 删除账户
```typescript
import { requestAccountDeletion } from "@/lib/actions/privacy"

const result = await requestAccountDeletion(userId, "用户主动删除")
// 软删除 + 匿名化
```

### 更新隐私设置
```typescript
import { updateUserPrivacySettings } from "@/lib/actions/privacy"

await updateUserPrivacySettings(userId, {
  profile_visibility: "private",
  show_email: false,
  allow_messages: true,
})
```

---

## 🗄️ 数据库查询

### 查看隐私设置
```sql
SELECT * FROM user_privacy_settings WHERE user_id = 'xxx';
```

### 查看导出请求
```sql
SELECT * FROM data_export_requests
WHERE user_id = 'xxx'
ORDER BY requested_at DESC;
```

### 查看删除请求
```sql
SELECT * FROM account_deletion_requests
WHERE user_id = 'xxx'
ORDER BY requested_at DESC;
```

### 查看已删除用户
```sql
SELECT id, username, deleted_at
FROM profiles
WHERE deleted_at IS NOT NULL;
```

---

## 🎨 Cookie 分类

### 必要 Cookie
- `session` - 会话管理
- `csrf_token` - CSRF 保护
- `cookie-consent` - Cookie 偏好

### 分析 Cookie
- `_ga` - Google Analytics
- `_gid` - Google Analytics
- `_gat` - Google Analytics

### 营销 Cookie
- 目前未使用

---

## ✅ GDPR 权利

| 权利 | 实现方式 | 位置 |
|------|---------|------|
| 访问权 | 查看个人资料 | `/settings` |
| 更正权 | 编辑个人资料 | `/settings` |
| 删除权 | 账户删除 | `/settings/privacy` |
| 可携权 | 数据导出 | `/settings/privacy` |
| 限制处理权 | 隐私设置 | `/settings/privacy` |
| 反对权 | Cookie 管理 | Cookie 横幅 |

---

## 🔍 故障排查

### Cookie 横幅不显示
```javascript
// 检查 localStorage
console.log(localStorage.getItem('cookie-consent'))

// 清除并刷新
localStorage.removeItem('cookie-consent')
location.reload()
```

### 隐私设置不保存
```sql
-- 检查 RLS 策略
SELECT * FROM user_privacy_settings WHERE user_id = auth.uid();

-- 检查用户权限
SELECT auth.uid();
```

### 数据导出失败
```typescript
// 检查用户 ID
console.log(userId)

// 检查数据库连接
const { data, error } = await supabase.from('profiles').select('*').single()
console.log(error)
```

---

## 📊 监控指标

### 每月检查
- Cookie 同意率
- 数据导出请求数
- 账户删除请求数
- 隐私设置使用率

### SQL 查询
```sql
-- Cookie 同意率（需要前端日志）
-- 数据导出请求统计
SELECT
  DATE_TRUNC('month', requested_at) as month,
  COUNT(*) as export_count
FROM data_export_requests
GROUP BY month
ORDER BY month DESC;

-- 账户删除统计
SELECT
  DATE_TRUNC('month', requested_at) as month,
  COUNT(*) as deletion_count
FROM account_deletion_requests
GROUP BY month
ORDER BY month DESC;
```

---

## 📞 联系方式

- **隐私问题**: privacy@ai-dating.com
- **DPO**: dpo@ai-dating.com
- **技术支持**: support@ai-dating.com

---

## 📚 文档链接

- [实现报告](./privacy-implementation-report.md)
- [GDPR 检查清单](./gdpr-checklist.md)
- [合规指南](./privacy-compliance-guide.md)
- [测试指南](./testing-guide.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)

---

**版本**: 1.0 | **更新**: 2026-03-08
