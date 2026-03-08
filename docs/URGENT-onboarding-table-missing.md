# 🚨 紧急修复：user_onboarding 表不存在

## 问题

错误代码：`PGRST205`
错误信息：`Could not find the table 'public.user_onboarding' in the schema cache`

**原因**：`user_onboarding` 表还没有在 Supabase 数据库中创建。

## 🔧 立即修复步骤

### 方法 1：在 Supabase SQL Editor 中运行脚本（推荐）

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制并运行 `scripts/create-onboarding-table.sql` 中的 SQL 脚本
4. 刷新浏览器页面

### 方法 2：使用 Supabase CLI 运行迁移

```bash
# 如果已安装 Supabase CLI
supabase db push

# 或者运行特定迁移
supabase migration up
```

### 方法 3：手动创建表（快速）

在 Supabase SQL Editor 中运行以下最小化脚本：

```sql
-- 快速创建表
CREATE TABLE IF NOT EXISTS user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  completed_profile BOOLEAN DEFAULT false,
  first_post_published BOOLEAN DEFAULT false,
  explored_content BOOLEAN DEFAULT false,
  checked_membership BOOLEAN DEFAULT false,
  tour_completed BOOLEAN DEFAULT false,
  tour_skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can manage own onboarding"
  ON user_onboarding
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 为现有用户创建记录
INSERT INTO user_onboarding (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
```

## ✅ 验证修复

运行以下 SQL 验证表已创建：

```sql
SELECT COUNT(*) as total_records
FROM user_onboarding;
```

应该返回至少 1 条记录（如果有用户的话）。

## 📋 相关文件

- 完整迁移脚本：`supabase/migrations/026_create_user_onboarding.sql`
- 创建表脚本：`scripts/create-onboarding-table.sql`
- 检查脚本：`scripts/check-onboarding-table.sql`

## 🔍 调试信息

当前错误日志显示：
```
[DEBUG] Fetching onboarding progress for user: 1a14fc2a-a426-418c-99a4-835dc1eacf93
[DEBUG] Onboarding query error: {
  code: 'PGRST205',
  message: "Could not find the table 'public.user_onboarding' in the schema cache",
  details: null,
  hint: "Perhaps you meant the table 'public.user_agents'"
}
```

## 💡 为什么会发生这个问题？

1. **迁移未运行**：`026_create_user_onboarding.sql` 迁移文件存在于本地，但还没有在 Supabase 数据库中执行
2. **新数据库**：可能是新连接的 Supabase 项目，需要运行所有迁移
3. **Schema 缓存**：Supabase 的 PostgREST 缓存中没有这个表

## 🛡️ 当前的优雅降级

代码已经实现了优雅降级：
- ✅ 如果表不存在，返回 `null`
- ✅ 页面不会崩溃
- ✅ 用户可以正常使用其他功能
- ⚠️ 但是引导功能不可用

## 📝 修复后的预期行为

1. 新用户注册时自动创建 onboarding 记录
2. 首次登录时显示引导流程
3. 用户可以跳过或完成引导
4. 引导进度会被保存

## 🔄 下一步

修复表创建后，建议：
1. 测试新用户注册流程
2. 测试引导流程启动
3. 测试引导完成/跳过功能
4. 检查所有迁移是否都已运行

## 📚 相关文档

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgREST Error Codes](https://postgrest.org/en/stable/errors.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
