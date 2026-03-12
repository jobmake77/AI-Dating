# Supabase CLI 数据库迁移教程

## 📋 教程概述

本教程将指导你使用 Supabase CLI 将 43 个数据库迁移文件推送到远程 Supabase 数据库。

**预计时间**: 15-30 分钟
**难度**: 简单
**适用场景**: 开发环境和生产环境

---

## ✅ 前置条件检查

在开始之前,请确认:

- [ ] 你有 Supabase 项目的访问权限
- [ ] 你的电脑已安装 Node.js (v16 或更高版本)
- [ ] 你有稳定的网络连接
- [ ] 你了解项目的 Supabase 项目 ID: `elufwtaomearxmbsshad`

### 检查 Node.js 版本

```bash
node --version
# 应该显示 v16.x.x 或更高版本
```

如果未安装 Node.js,请访问 [nodejs.org](https://nodejs.org/) 下载安装。

---

## 步骤 1: 安装 Supabase CLI

### macOS

**⚠️ 注意**: Supabase CLI 不再支持 `npm install -g` 安装方式。

#### 方式 1: 使用 Homebrew (推荐)

```bash
# 如果未安装 Homebrew，先安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Supabase CLI
brew install supabase/tap/supabase
```

#### 方式 2: 直接下载二进制文件 (最快)

```bash
# 下载并安装
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_arm64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# 如果是 Intel Mac，使用这个命令
# curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz | tar -xz
# sudo mv supabase /usr/local/bin/
```

#### 方式 3: 使用 npx (无需安装)

```bash
# 直接使用 npx 运行命令，无需安装
npx supabase login
npx supabase link --project-ref elufwtaomearxmbsshad
npx supabase db push
```

### Linux

```bash
# 下载并安装
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### Windows

```bash
# 使用 Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 或下载 .exe 文件
# 访问: https://github.com/supabase/cli/releases
```

### 验证安装

```bash
supabase --version
# 应该显示版本号,例如: 1.x.x

# 如果使用 npx
npx supabase --version
```

<thinking>
安装步骤已经写好了。现在继续写登录和链接项目的步骤。
</thinking>

---

## 步骤 2: 登录 Supabase

### 2.1 启动登录流程

```bash
supabase login
```

### 2.2 获取 Access Token

命令执行后,会自动打开浏览器并跳转到 Supabase 登录页面。

如果浏览器没有自动打开,请手动访问显示的 URL。

### 2.3 生成 Access Token

1. 在浏览器中登录你的 Supabase 账户
2. 授权 CLI 访问你的账户
3. 复制生成的 Access Token
4. 返回终端,粘贴 Access Token 并按回车

### 2.4 验证登录状态

```bash
# 列出你有权访问的所有项目
supabase projects list
```

你应该能看到项目 `elufwtaomearxmbsshad` 在列表中。

---

## 步骤 3: 链接到远程项目

### 3.1 进入项目目录

```bash
cd /Users/a77/Desktop/AI-Dating
```

### 3.2 链接项目

```bash
supabase link --project-ref elufwtaomearxmbsshad
```

### 3.3 输入数据库密码

系统会提示你输入数据库密码:

```
Enter your database password:
```

**如何获取数据库密码**:
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/elufwtaomearxmbsshad/settings/database)
2. 进入 **Settings** > **Database**
3. 找到 **Database Password** 部分
4. 如果忘记密码,点击 **Reset Database Password**

### 3.4 验证链接状态

```bash
# 查看当前链接的项目
supabase status
```

输出应该显示:
```
Project ID: elufwtaomearxmbsshad
Status: Linked
```

---

## 步骤 4: 检查待推送的迁移

### 4.1 查看本地迁移文件

```bash
ls -la supabase/migrations/
```

你应该看到 43 个迁移文件 (002-044)。

### 4.2 检查远程数据库状态

```bash
# 查看哪些迁移还未应用
supabase db diff --linked
```

这个命令会显示:
- 已应用的迁移
- 待应用的迁移
- 本地和远程的差异

---

## 步骤 5: 推送迁移 (核心步骤)

### 5.1 创建数据库备份 (强烈推荐)

在推送迁移前,先创建备份:

```bash
# 方式 1: 使用 Supabase Dashboard
# 访问: https://supabase.com/dashboard/project/elufwtaomearxmbsshad/settings/backups
# 点击 "Create Backup"

# 方式 2: 使用 pg_dump (如果已安装 PostgreSQL 客户端)
# 需要先获取数据库连接字符串
```

### 5.2 推送迁移

```bash
supabase db push
```

### 5.3 确认推送

系统会显示将要应用的迁移列表,并询问确认:

```
The following migrations will be applied:
  002_content_functions.sql
  003_refactor_tags_driven.sql
  ...
  044_add_missing_foreign_keys.sql

Do you want to continue? [y/N]
```

输入 `y` 并按回车确认。

### 5.4 观察执行过程

CLI 会逐个执行迁移文件,并显示进度:

```
Applying migration 002_content_functions.sql...
✓ 002_content_functions.sql applied successfully

Applying migration 003_refactor_tags_driven.sql...
✓ 003_refactor_tags_driven.sql applied successfully

...

✓ All migrations applied successfully!
```

**预计执行时间**: 2-5 分钟

---

## 步骤 6: 验证迁移结果

### 6.1 检查迁移状态

```bash
# 查看已应用的迁移
supabase migration list
```

### 6.2 使用验证脚本

```bash
# 获取数据库连接字符串
supabase db url --linked

# 使用验证脚本
psql "$(supabase db url --linked)" -f verify-migration.sql
```

### 6.3 在 Supabase Dashboard 中验证

1. 访问 [Table Editor](https://supabase.com/dashboard/project/elufwtaomearxmbsshad/editor)
2. 检查是否有以下核心表:
   - users
   - contents
   - comments
   - likes
   - follows
   - communities
   - events
   - notifications

3. 访问 [SQL Editor](https://supabase.com/dashboard/project/elufwtaomearxmbsshad/sql)
4. 运行验证查询:

```sql
-- 检查表数量
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- 应该返回 30+ 个表

-- 检查触发器
SELECT COUNT(*) FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- 应该返回 2+ 个触发器

-- 检查外键
SELECT COUNT(*) FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
-- 应该返回 20+ 个外键
```

---

## 步骤 7: 重新生成 TypeScript 类型

迁移完成后,需要重新生成类型定义:

```bash
# 生成类型定义
supabase gen types typescript --linked > types/database.types.ts
```

验证生成的类型文件:

```bash
# 检查文件大小 (应该 > 10KB)
ls -lh types/database.types.ts

# 查看文件内容 (前 50 行)
head -50 types/database.types.ts
```

---

## 步骤 8: 测试应用

### 8.1 启动开发服务器

```bash
npm run dev
```

### 8.2 测试核心功能

访问 `http://localhost:3000` 并测试:

- [ ] 用户注册/登录
- [ ] 创建内容
- [ ] 评论功能
- [ ] 点赞功能
- [ ] 关注功能
- [ ] 聊天功能
- [ ] 社区功能
- [ ] 活动功能

### 8.3 检查控制台错误

打开浏览器开发者工具,检查是否有:
- 数据库查询错误
- 类型错误
- RLS 策略错误

---

## 🚨 常见问题处理

### 问题 1: 登录失败

**症状**: `supabase login` 命令失败

**解决方案**:
```bash
# 清除缓存
rm -rf ~/.supabase

# 重新登录
supabase login
```

### 问题 2: 链接项目失败

**症状**: `Error: Failed to link project`

**解决方案**:
1. 检查项目 ID 是否正确
2. 确认你有项目访问权限
3. 检查数据库密码是否正确

```bash
# 重新链接
supabase link --project-ref elufwtaomearxmbsshad --password YOUR_PASSWORD
```

### 问题 3: 迁移推送失败

**症状**: 某个迁移文件执行失败

**解决方案**:

1. 查看详细错误信息:
```bash
supabase db push --debug
```

2. 常见错误类型:

**错误: 表已存在**
```
ERROR: relation "table_name" already exists
```
解决: 该迁移可能已经执行过,跳过或删除该表后重试

**错误: 外键约束失败**
```
ERROR: insert or update on table violates foreign key constraint
```
解决: 检查引用的表是否存在,数据是否符合约束

**错误: RLS 策略冲突**
```
ERROR: policy "policy_name" already exists
```
解决: 先删除旧策略再创建新策略

3. 手动修复后重新推送:
```bash
supabase db push
```

### 问题 4: pg_cron 扩展未启用

**症状**: Cron Job 创建失败

**解决方案**:
1. 访问 [Database Extensions](https://supabase.com/dashboard/project/elufwtaomearxmbsshad/database/extensions)
2. 搜索 `pg_cron`
3. 点击 **Enable** 启用扩展
4. 重新推送迁移

### 问题 5: 类型生成失败

**症状**: `supabase gen types` 命令失败

**解决方案**:
```bash
# 使用项目 ID 直接生成
npx supabase gen types typescript \
  --project-id elufwtaomearxmbsshad \
  --schema public \
  > types/database.types.ts
```

---

## 🔄 回滚策略

如果迁移出现严重问题,需要回滚:

### 方式 1: 使用 Supabase Dashboard 恢复备份

1. 访问 [Backups](https://supabase.com/dashboard/project/elufwtaomearxmbsshad/settings/backups)
2. 选择迁移前的备份
3. 点击 **Restore**

### 方式 2: 使用 pg_dump 备份恢复

```bash
# 如果你在迁移前创建了 pg_dump 备份
psql "$(supabase db url --linked)" < backup_20260309.sql
```

### 方式 3: 手动回滚迁移

```bash
# 查看迁移历史
supabase migration list

# 回滚到特定版本 (谨慎使用)
# 注意: Supabase CLI 不直接支持回滚,需要手动编写回滚 SQL
```

---

## ✅ 迁移完成检查清单

完成以下检查,确认迁移成功:

- [ ] 所有 43 个迁移文件已应用
- [ ] 数据库有 30+ 个表
- [ ] 触发器已创建 (followers_count, following_count)
- [ ] Cron Jobs 已创建 (4 个清理任务)
- [ ] 外键约束已添加 (20+ 个)
- [ ] 索引已创建 (30+ 个)
- [ ] TypeScript 类型已重新生成
- [ ] 应用启动无错误
- [ ] 核心功能测试通过

---

## 📚 相关命令参考

### 常用 Supabase CLI 命令

```bash
# 查看帮助
supabase --help

# 查看项目状态
supabase status

# 列出所有项目
supabase projects list

# 查看数据库 URL
supabase db url --linked

# 查看迁移列表
supabase migration list

# 创建新迁移
supabase migration new migration_name

# 查看数据库差异
supabase db diff --linked

# 推送迁移
supabase db push

# 生成类型
supabase gen types typescript --linked

# 取消链接
supabase unlink
```

---

## 🎯 下一步

迁移完成后,建议:

1. **性能测试**: 测试关键页面的加载速度
2. **监控设置**: 在 Supabase Dashboard 设置告警
3. **文档更新**: 更新项目文档,记录迁移日期
4. **团队通知**: 通知团队成员数据库已更新

---

## 📞 获取帮助

如果遇到问题:

1. **查看 Supabase 文档**: https://supabase.com/docs
2. **Supabase Discord**: https://discord.supabase.com
3. **项目文档**:
   - [完整迁移指南](./database-migration-guide.md)
   - [快速开始](./MIGRATION-QUICKSTART.md)
   - [修复进度报告](./fix-progress-report.md)

---

**创建时间**: 2026-03-09
**最后更新**: 2026-03-09
**适用版本**: Supabase CLI v1.x
