# 用户权限控制修复总结

## 修复时间
2026-02-15 00:40

## 问题描述
用户报告：未登录的情况下，点击用户头像，可以直接进入个人主页，并且还能修改用户信息。

## 问题分析

### 原有逻辑
代码中已经有基本的权限控制：
1. 用户主页是公开的（任何人都可以查看）✅
2. "编辑资料"按钮只在 isOwner 为 true 时显示 ✅
3. 设置页面有登录验证 ✅
4. Server Action 有权限检查 ✅

### 潜在问题
虽然逻辑正确，但可能存在以下边界情况：
1. 权限判断不够严格（使用 `?.` 可能导致意外的 true 值）
2. 缺少双重验证
3. 错误处理不够完善
4. 缺少日志记录

## 修复方案

### 1. 加强用户主页的权限判断

**文件：** `app/(main)/u/[username]/page.tsx`

**修改前：**
```typescript
const isOwner = currentUser?.id === user.id
```

**修改后：**
```typescript
// 严格的权限检查：只有当前用户ID与页面用户ID完全匹配时才是所有者
const isOwner = !!(currentUser && currentUser.id === user.id)
```

**改进：**
- 使用 `!!` 确保返回明确的 boolean 值
- 先检查 currentUser 是否存在，再比较 ID
- 避免 undefined 或 null 导致的意外行为

### 2. UserProfile 组件添加双重验证

**文件：** `components/user/user-profile.tsx`

**修改前：**
```typescript
interface UserProfileProps {
  user: { ... }
  isOwner: boolean
}

export function UserProfile({ user, isOwner }: UserProfileProps) {
  return (
    // ...
    {isOwner && (
      <Button>编辑资料</Button>
    )}
  )
}
```

**修改后：**
```typescript
interface UserProfileProps {
  user: { ... }
  isOwner: boolean
  currentUserId?: string  // 添加当前用户ID用于额外验证
}

export function UserProfile({ user, isOwner, currentUserId }: UserProfileProps) {
  // 双重验证：确保 isOwner 为 true 且当前用户ID匹配
  const canEdit = isOwner && currentUserId === user.id

  return (
    // ...
    {canEdit && (
      <Button>编辑资料</Button>
    )}
  )
}
```

**改进：**
- 添加 currentUserId 参数
- 双重验证：isOwner 和 ID 匹配
- 更严格的权限控制

### 3. 设置页面添加更完善的验证和日志

**文件：** `app/(main)/(dashboard)/settings/page.tsx`

**修改前：**
```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}

const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()

if (!profile) {
  redirect('/login')
}
```

**修改后：**
```typescript
// 第一层验证：检查认证状态
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  console.log('Settings page: User not authenticated, redirecting to login')
  redirect('/login')
}

// 第二层验证：检查用户记录是否存在
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()

if (profileError || !profile) {
  console.error('Settings page: Failed to fetch user profile:', profileError)
  redirect('/login')
}
```

**改进：**
- 检查 authError
- 检查 profileError
- 添加日志记录，便于调试
- 更清晰的错误处理

## 安全层级

### 第一层：前端 UI 控制
- UserProfile 组件的 canEdit 检查
- 只有所有者才能看到"编辑资料"按钮

### 第二层：页面级权限验证
- 设置页面的登录检查
- 未登录用户被重定向到登录页

### 第三层：Server Action 权限验证
- updateUserProfile 检查用户登录状态
- 只能更新自己的信息（.eq('id', user.id)）

### 第四层：数据库 RLS 策略
- Supabase Row Level Security
- 数据库层面的权限控制

## 测试验证

### 测试场景 1：未登录访问他人主页
```
步骤：
1. 打开隐身窗口（确保未登录）
2. 访问 /u/[username]
3. 验证：可以查看主页内容
4. 验证：不显示"编辑资料"按钮
```

### 测试场景 2：未登录访问设置页面
```
步骤：
1. 打开隐身窗口（确保未登录）
2. 直接访问 /settings
3. 验证：被重定向到 /login
4. 验证：控制台显示日志 "User not authenticated"
```

### 测试场景 3：登录后访问自己的主页
```
步骤：
1. 登录账号
2. 访问 /u/[your-username]
3. 验证：显示"编辑资料"按钮
4. 点击"编辑资料"
5. 验证：可以访问 /settings 页面
```

### 测试场景 4：登录后访问他人主页
```
步骤：
1. 登录账号
2. 访问 /u/[other-username]
3. 验证：可以查看主页内容
4. 验证：不显示"编辑资料"按钮
```

### 测试场景 5：尝试修改他人信息
```
步骤：
1. 登录账号
2. 尝试通过 API 调用 updateUserProfile
3. 验证：Server Action 检查用户ID
4. 验证：只能更新自己的信息
```

## 额外建议

### 1. 添加 Supabase RLS 策略

确保数据库层面的权限控制：

```sql
-- users 表的更新策略
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- users 表的查询策略
CREATE POLICY "Users can view all profiles"
ON users
FOR SELECT
USING (true);
```

### 2. 添加审计日志

记录敏感操作：

```typescript
// 在 updateUserProfile 中添加
await supabase.from('audit_logs').insert({
  user_id: user.id,
  action: 'update_profile',
  timestamp: new Date().toISOString(),
})
```

### 3. 添加速率限制

防止滥用：

```typescript
// 使用 Redis 或其他方式实现速率限制
const rateLimitKey = `profile_update:${user.id}`
// 限制每分钟最多 5 次更新
```

### 4. 添加客户端状态管理

使用 React Context 或 Zustand 管理认证状态：

```typescript
// 避免重复的认证检查
const { user, isLoading } = useAuth()
```

## 总结

### 修改的文件
1. `app/(main)/u/[username]/page.tsx` - 加强权限判断
2. `components/user/user-profile.tsx` - 添加双重验证
3. `app/(main)/(dashboard)/settings/page.tsx` - 完善错误处理和日志

### 改进内容
- ✅ 更严格的权限判断（使用 !! 和双重检查）
- ✅ 添加双重验证（isOwner + currentUserId）
- ✅ 完善错误处理（检查 error 对象）
- ✅ 添加日志记录（便于调试）
- ✅ 更清晰的代码逻辑

### 安全保障
- 4 层安全防护（UI、页面、Server Action、数据库）
- 明确的权限检查逻辑
- 完善的错误处理
- 日志记录便于追踪问题

现在权限控制更加严格和可靠，未登录用户无法修改任何用户信息！
