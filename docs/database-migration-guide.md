# 数据库迁移实施指南

## 项目信息
- **Supabase 项目 ID**: `elufwtaomearxmbsshad`
- **迁移文件数量**: 47 个
- **迁移文件路径**: `/Users/a77/Desktop/AI-Dating/supabase/migrations/`

---

## 方案 1: 使用 Supabase CLI (推荐)

### 前置条件
1. 安装 Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. 登录 Supabase:
   ```bash
   supabase login
   ```

3. 链接到远程项目:
   ```bash
   supabase link --project-ref elufwtaomearxmbsshad
   ```

### 执行迁移

#### 选项 A: 推送所有待处理的迁移 (推荐)
```bash
# 查看待处理的迁移
supabase db diff --linked

# 推送所有本地迁移到远程数据库
supabase db push
```

#### 选项 B: 重置数据库并应用所有迁移 (⚠️ 会删除所有数据)
```bash
# 仅在开发环境使用!
supabase db reset --linked
```


---

## 方案 2: 使用 Supabase Dashboard (适合小规模迁移)

### 步骤
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/elufwtaomearxmbsshad)
2. 进入 **SQL Editor**
3. 按顺序执行迁移文件 (002-044)

### 注意事项
- ⚠️ 必须按编号顺序执行
- ⚠️ 每个文件执行后检查错误
- ⚠️ 跳过 `complete_fix.sql` 和 `20260214_*.sql`

---

## 方案 3: 使用批量执行脚本 (最快速)

创建 `migrate.sh`:
```bash
#!/bin/bash
set -e

# 替换为你的数据库密码
DB_PASSWORD="your-password-here"
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.elufwtaomearxmbsshad.supabase.co:5432/postgres"

echo "🚀 开始执行数据库迁移..."

# 按顺序执行迁移
for i in {002..044}; do
  for file in supabase/migrations/${i}_*.sql; do
    if [ -f "$file" ]; then
      echo "📝 执行: $file"
      psql $DATABASE_URL -f "$file"
      if [ $? -eq 0 ]; then
        echo "✅ 成功"
      else
        echo "❌ 失败: $file"
        exit 1
      fi
    fi
  done
done

echo "🎉 所有迁移执行完成!"
```

执行:
```bash
chmod +x migrate.sh
./migrate.sh
```

---

## 迁移后验证清单

### 1. 检查表结构
```sql
-- 应该有这些核心表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

预期表:
- users, contents, comments, likes, reposts, follows
- notifications, conversations, messages
- communities, community_members, community_posts
- events, event_participants
- tags, content_tags
- user_agents, analytics_events, performance_monitoring

### 2. 检查触发器
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

预期触发器:
- `update_followers_count_trigger` (follows 表)
- `update_following_count_trigger` (follows 表)

### 3. 检查 Cron Jobs
```sql
SELECT jobname, schedule, command 
FROM cron.job;
```

预期 Cron Jobs:
- `cleanup_old_analytics_events` (每天清理)
- `cleanup_old_notifications` (每天清理)
- `cleanup_old_performance_logs` (每天清理)
- `cleanup_old_archived_data` (每周清理)

### 4. 检查索引
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

### 5. 验证软删除功能
```sql
-- 检查 deleted_at 字段
SELECT column_name, table_name 
FROM information_schema.columns 
WHERE column_name = 'deleted_at' 
AND table_schema = 'public';
```

---

## 常见问题

### Q1: 如何查看已执行的迁移?
```sql
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version;
```

### Q2: 迁移失败如何回滚?
```bash
# 使用 Supabase Dashboard 恢复备份
# 或使用 pg_dump 备份文件
psql $DATABASE_URL < backup.sql
```

### Q3: 如何跳过某个迁移?
不建议跳过,但如果必须:
```sql
-- 手动标记为已执行
INSERT INTO supabase_migrations.schema_migrations (version) 
VALUES ('002_content_functions');
```

### Q4: Cron Job 未创建?
```sql
-- 启用 pg_cron 扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 重新执行 041_data_cleanup_cron.sql
```

---

## 生产环境迁移步骤

### 准备阶段
1. ✅ 创建数据库备份
2. ✅ 在测试环境完整测试
3. ✅ 准备回滚计划
4. ✅ 设置维护窗口

### 执行阶段
```bash
# 1. 备份数据库
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 执行迁移
./migrate.sh

# 3. 验证结果
psql $DATABASE_URL -f verify.sql
```

### 验证阶段
1. ✅ 检查所有表和索引
2. ✅ 测试核心功能
3. ✅ 检查错误日志
4. ✅ 重新生成类型定义

---

## 迁移完成后的任务

### 1. 重新生成 TypeScript 类型
```bash
npx supabase gen types typescript \
  --project-id elufwtaomearxmbsshad \
  > types/database.types.ts
```

### 2. 验证应用功能
- 用户注册/登录
- 内容创建/编辑/删除
- 评论/点赞/转发
- 关注/取消关注
- 聊天功能
- 社区功能
- 活动功能

### 3. 性能测试
- 首页加载时间
- 聊天列表加载
- 搜索响应时间
- 实时订阅延迟

---

**创建时间**: 2026-03-09
**最后更新**: 2026-03-09
