# 数据库迁移快速开始

## 🚀 三种方式执行迁移

### 方式 1: 使用 Supabase CLI (推荐)

**📖 详细教程**: [Supabase CLI 迁移教程](./supabase-cli-migration-tutorial.md)

```bash
# 1. 安装 CLI (macOS)
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_arm64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# 或使用 npx (无需安装)
# npx supabase login

# 2. 登录
supabase login

# 3. 链接项目
supabase link --project-ref elufwtaomearxmbsshad

# 4. 推送迁移
supabase db push
```

**优点**:
- ✅ 自动管理迁移顺序
- ✅ 支持回滚和版本控制
- ✅ 官方推荐方式
- ✅ 适合团队协作

**预计时间**: 15-30 分钟

### 方式 2: 使用迁移脚本 (最快)

```bash
# 1. 获取数据库密码
# 访问: https://supabase.com/dashboard/project/elufwtaomearxmbsshad/settings/database
# 复制 Database Password

# 2. 执行迁移
./migrate.sh "postgresql://postgres:YOUR_PASSWORD@db.elufwtaomearxmbsshad.supabase.co:5432/postgres"

# 3. 验证结果
psql "postgresql://postgres:YOUR_PASSWORD@db.elufwtaomearxmbsshad.supabase.co:5432/postgres" -f verify-migration.sql
```

### 方式 3: 使用 Supabase Dashboard (手动)

1. 访问 [SQL Editor](https://supabase.com/dashboard/project/elufwtaomearxmbsshad/sql)
2. 依次复制粘贴执行 `supabase/migrations/` 中的文件 (002-044)

---

## ✅ 迁移后必做事项

### 1. 重新生成 TypeScript 类型

```bash
npx supabase gen types typescript \
  --project-id elufwtaomearxmbsshad \
  > types/database.types.ts
```

### 2. 验证数据库

```bash
# 使用验证脚本
psql $DATABASE_URL -f verify-migration.sql

# 或手动检查
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### 3. 测试应用

```bash
# 启动开发服务器
npm run dev

# 测试核心功能
# - 用户注册/登录
# - 内容创建/编辑
# - 评论/点赞
# - 聊天功能
```

---

## 📋 迁移文件清单

总计 **43 个迁移文件** (002-044):

- **阶段 1** (002-017): 核心表结构
- **阶段 2** (018-024): 社区和活动
- **阶段 3** (025-038): 增强功能
- **阶段 4** (039-044): 数据完整性修复

详细清单见 [database-migration-guide.md](./database-migration-guide.md)

---

## ⚠️ 注意事项

### 生产环境迁移前

1. ✅ **创建备份**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. ✅ **在测试环境完整测试**

3. ✅ **准备回滚计划**

4. ✅ **设置维护窗口**

### 常见问题

**Q: 迁移失败怎么办?**
- 查看错误信息
- 检查是否有表/约束冲突
- 必要时回滚到备份

**Q: 如何查看已执行的迁移?**
```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

**Q: Cron Job 未创建?**
```sql
-- 启用 pg_cron 扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

---

## 📚 相关文档

- [完整迁移指南](./database-migration-guide.md)
- [修复进度报告](./fix-progress-report.md)
- [任务清单](../tasks/todo.md)

---

**创建时间**: 2026-03-09
