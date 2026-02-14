# Supabase 配置指南

本文档指导你如何创建和配置 Supabase 项目。

---

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 点击 "New project"
5. 填写项目信息：
   - **Name**: ai-dating
   - **Database Password**: 生成一个强密码（保存好！）
   - **Region**: 选择离你最近的区域（建议：Singapore 或 Tokyo）
   - **Pricing Plan**: Free（免费版）
6. 点击 "Create new project"
7. 等待项目创建完成（约 2-3 分钟）

---

## 步骤 2: 获取 API 密钥

项目创建完成后：

1. 在左侧菜单点击 "Project Settings"（齿轮图标）
2. 点击 "API" 标签
3. 你会看到以下信息：

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
复制这个 URL

### API Keys

#### anon public (公开密钥)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
复制这个密钥

#### service_role (服务端密钥)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
复制这个密钥（⚠️ 保密！不要提交到 Git）

---

## 步骤 3: 配置环境变量

1. 打开项目根目录的 `.env.local` 文件
2. 替换以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_密钥
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_密钥
```

3. 保存文件

---

## 步骤 4: 创建数据库表

### 方法 1: 使用 SQL Editor（推荐）

1. 在 Supabase Dashboard 左侧菜单点击 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/migrations/20260214_initial_schema.sql` 文件的全部内容
4. 粘贴到 SQL Editor
5. 点击 "Run" 执行
6. 等待执行完成，应该显示 "Success. No rows returned"

### 方法 2: 使用 Supabase CLI（可选）

如果你安装了 Supabase CLI：

```bash
supabase db push
```

---

## 步骤 5: 配置 GitHub OAuth

### 5.1 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "OAuth Apps" → "New OAuth App"
3. 填写信息：
   - **Application name**: AI-Dating
   - **Homepage URL**: `http://localhost:3000`（开发环境）
   - **Authorization callback URL**: `https://你的项目ID.supabase.co/auth/v1/callback`
     - 在 Supabase Dashboard → Settings → API → URL 中找到你的项目 URL
     - 格式：`https://xxxxx.supabase.co/auth/v1/callback`
4. 点击 "Register application"
5. 复制 **Client ID**
6. 点击 "Generate a new client secret"
7. 复制 **Client Secret**（⚠️ 只显示一次！）

### 5.2 在 Supabase 中配置 GitHub OAuth

1. 在 Supabase Dashboard 左侧菜单点击 "Authentication"
2. 点击 "Providers" 标签
3. 找到 "GitHub" 并点击
4. 启用 "Enable GitHub provider"
5. 填写：
   - **Client ID**: 你的 GitHub OAuth App Client ID
   - **Client Secret**: 你的 GitHub OAuth App Client Secret
6. 点击 "Save"

---

## 步骤 6: 验证配置

### 6.1 检查数据库表

1. 在 Supabase Dashboard 左侧菜单点击 "Table Editor"
2. 你应该看到以下表：
   - users
   - contents
   - moderation_logs
   - subscriptions

### 6.2 测试连接

重启开发服务器：

```bash
npm run dev
```

如果没有错误，说明配置成功！

---

## 常见问题

### Q: 找不到 Project URL 或 API Keys？
A: 确保你在 Project Settings → API 页面。

### Q: SQL 执行失败？
A: 检查是否有语法错误，或者尝试分段执行。

### Q: GitHub OAuth 回调 URL 错误？
A: 确保 URL 格式正确：`https://你的项目ID.supabase.co/auth/v1/callback`

### Q: 环境变量不生效？
A: 重启开发服务器（`npm run dev`）

---

## 下一步

配置完成后，你可以：

1. 测试 GitHub 登录功能
2. 创建第一个用户
3. 开始开发内容发布功能

---

**配置完成后，请告诉我，我们继续下一步！**
