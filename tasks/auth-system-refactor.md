# 认证系统重构文档

## 重构日期
2026-02-15

## 问题描述
用户报告 "signal is aborted without reason" 错误,要求重新构建整个认证系统。

## 重构内容

### 1. 创建统一的认证 Hook

**文件**: `lib/hooks/use-auth.ts`

**功能**:
- 统一管理认证状态
- 使用 `isMounted` 模式防止 signal abort 错误
- 自动监听认证状态变化
- 提供 `user`, `username`, `isLoading`, `error` 状态

**关键特性**:
```typescript
- 使用 isMounted 标志防止组件卸载后的状态更新
- 在 cleanup 函数中取消订阅
- 统一的错误处理
```

### 2. 简化 Site Header

**文件**: `components/layout/site-header.tsx`

**改进**:
- 使用 `useAuth` hook 替代内部状态管理
- 移除重复的 useEffect 逻辑
- 简化显示逻辑
- 更好的 fallback 处理

**显示优先级**:
1. GitHub 用户名 (`user.user_metadata.user_name`)
2. 数据库 username
3. 邮箱前缀
4. "用户"

**链接逻辑**:
- 有 username → 跳转到 `/u/{username}`
- 无 username → 跳转到 `/settings`

### 3. Auth Callback 优化

**文件**: `app/auth/callback/route.ts`

**改进**:
- 使用 `upsert` 替代 `insert`
- 每次登录都更新用户信息
- 确保 username 和头像始终同步

### 4. 登录页面

**文件**: `app/(auth)/login/page.tsx`

**已有的保护**:
- 使用 `isMounted` 模式
- 在后台检查 session,不阻塞 UI
- 正确的 cleanup 函数

## 认证流程

### GitHub OAuth 流程

```
1. 用户点击 "GitHub 登录"
   ↓
2. 调用 signInWithGitHub() Server Action
   ↓
3. 跳转到 GitHub 授权页面
   ↓
4. 用户授权后,GitHub 重定向到 /auth/callback?code=xxx
   ↓
5. Auth Callback 处理:
   - 交换 code 获取 session
   - Upsert 用户记录到数据库
   - 重定向到首页
   ↓
6. Site Header 检测到认证状态变化:
   - onAuthStateChange 触发
   - 获取用户信息和 username
   - 更新 UI 显示登录状态
```

### 邮箱登录流程

```
1. 用户输入邮箱和密码
   ↓
2. 调用 signInWithEmail() Server Action
   ↓
3. Supabase 验证凭证
   ↓
4. 成功后重定向到首页
   ↓
5. Site Header 检测到认证状态变化
   ↓
6. 显示登录状态
```

### 邮箱注册流程

```
1. 用户输入邮箱和密码
   ↓
2. 调用 signUpWithEmail() Server Action
   ↓
3. Supabase 创建用户
   ↓
4. 如果关闭了邮箱验证:
   - 自动登录
   - 重定向到首页
   ↓
5. 如果启用了邮箱验证:
   - 发送验证邮件
   - 显示提示信息
```

## 数据库结构

### users 表

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  email TEXT,
  avatar TEXT,
  github_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**关键字段**:
- `id`: 关联 Supabase Auth 用户
- `username`: 用户名,可能为 NULL
- `email`: 邮箱地址
- `avatar`: 头像 URL
- `github_url`: GitHub 主页链接
- `role`: 用户角色 (user/admin)

## 防止 Signal Abort 的关键模式

### 1. isMounted 模式

```typescript
useEffect(() => {
  let isMounted = true

  const fetchData = async () => {
    const data = await someAsyncOperation()

    // 只在组件仍然挂载时更新状态
    if (!isMounted) return

    setState(data)
  }

  fetchData()

  return () => {
    isMounted = false
  }
}, [])
```

### 2. 订阅清理

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

### 3. 避免在 cleanup 后调用 setState

```typescript
// ❌ 错误
useEffect(() => {
  fetchData().then(data => setState(data))
}, [])

// ✅ 正确
useEffect(() => {
  let isMounted = true

  fetchData().then(data => {
    if (isMounted) setState(data)
  })

  return () => { isMounted = false }
}, [])
```

## 测试步骤

### 1. GitHub 登录测试

1. 访问 http://localhost:3000/login
2. 点击 "使用 GitHub 登录"
3. 授权后应该:
   - 返回首页
   - 右上角显示 GitHub 头像和用户名
   - 不出现 "signal is aborted" 错误

### 2. 邮箱登录测试

1. 访问 http://localhost:3000/login
2. 切换到 "登录" 标签
3. 输入已注册的邮箱和密码
4. 点击 "邮箱登录"
5. 应该:
   - 跳转到首页
   - 显示登录状态
   - 不出现错误

### 3. 邮箱注册测试

1. 访问 http://localhost:3000/login
2. 切换到 "注册" 标签
3. 输入新邮箱和密码
4. 点击 "邮箱注册"
5. 应该:
   - 显示成功消息
   - 自动跳转到首页(如果关闭了邮箱验证)
   - 不出现错误

### 4. 退出登录测试

1. 登录后,点击右上角 "退出"
2. 应该:
   - 显示 "已退出登录" 提示
   - 返回首页
   - 右上角显示 "登录" 按钮

## 常见问题

### Q: 为什么 GitHub 登录后不显示登录状态?

A: 检查以下几点:
1. Auth callback 是否成功 upsert 用户记录
2. 浏览器控制台是否有错误
3. 检查 `users` 表是否有该用户记录
4. 检查 username 字段是否为 NULL

### Q: 为什么出现 "signal is aborted" 错误?

A: 通常是因为:
1. 组件卸载时仍在执行异步操作
2. 没有使用 isMounted 模式
3. 没有正确清理订阅

解决方案:
- 使用 `useAuth` hook(已包含 isMounted 模式)
- 确保所有 useEffect 都有 cleanup 函数

### Q: 邮箱注册报错 "Error sending confirmation email"?

A: 解决方案:
1. 在 Supabase Dashboard 关闭 "Confirm email"
2. 或配置自定义 SMTP

详见: `tasks/email-signup-error-fix.md`

## 下一步优化

1. **添加 Loading 状态优化**
   - 使用 Skeleton 组件
   - 优化加载体验

2. **添加错误边界**
   - 捕获认证相关错误
   - 提供友好的错误提示

3. **添加会话刷新**
   - 自动刷新过期的 session
   - 避免用户突然被登出

4. **添加记住我功能**
   - 持久化登录状态
   - 使用 localStorage

## 总结

重构后的认证系统:
- ✅ 统一的状态管理 (useAuth hook)
- ✅ 防止 signal abort 错误 (isMounted 模式)
- ✅ 简化的组件逻辑
- ✅ 更好的错误处理
- ✅ 自动同步用户信息 (upsert)
- ✅ 优雅的 fallback 处理

所有认证相关的代码都经过重构,应该不会再出现 "signal is aborted" 错误。
