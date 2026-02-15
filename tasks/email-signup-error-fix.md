# 邮箱注册错误修复

## 问题
注册邮箱时显示错误："Error sending confirmation email"

## 原因
Supabase 发送验证邮件失败，可能是因为：
1. 使用默认 SMTP，超过限制（每小时 3 封）
2. 邮件服务暂时不可用
3. 没有配置 SMTP

## 快速解决方案

### 方案 1：关闭邮箱验证（推荐用于开发环境）

这是最快的解决方案，适合开发和测试：

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Providers** > **Email**
4. **关闭** "Confirm email" 开关
5. 点击 Save

**效果：**
- 注册后无需验证邮箱
- 立即可以登录
- 不会发送验证邮件

### 方案 2：配置自定义 SMTP（推荐用于生产环境）

如果需要邮箱验证功能：

#### 使用 Gmail（免费）

1. 进入 **Project Settings** > **Auth** > **SMTP Settings**
2. 启用 "Enable Custom SMTP"
3. 填写配置：
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [应用专用密码]
   Sender email: your-email@gmail.com
   Sender name: AI-Dating
   ```

**如何获取 Gmail 应用专用密码：**
1. 访问 https://myaccount.google.com/security
2. 启用两步验证
3. 搜索"应用专用密码"
4. 创建新的应用密码
5. 复制密码并粘贴到 Supabase

#### 使用 Resend（推荐）

免费额度：3000 封/月

1. 注册 https://resend.com
2. 获取 API Key
3. 在 Supabase 配置：
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [your-api-key]
   Sender email: onboarding@resend.dev
   Sender name: AI-Dating
   ```

#### 使用 SendGrid

免费额度：100 封/天

1. 注册 https://sendgrid.com
2. 创建 API Key
3. 在 Supabase 配置：
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [your-api-key]
   Sender email: your-verified-email@domain.com
   Sender name: AI-Dating
   ```

## 代码改进

我已经改进了错误处理，现在会显示更友好的错误消息：

### 改进 1：更好的错误提示

**之前：**
```
Error sending confirmation email
```

**现在：**
```
邮件发送失败。建议：
1) 在 Supabase 中关闭邮箱验证
2) 配置自定义 SMTP

⚠️ 用户已创建，但验证邮件发送失败。
你可以在 Supabase Dashboard 中手动验证用户。
```

### 改进 2：处理不同的错误类型

- **Email rate limit exceeded** → "发送邮件过于频繁，请稍后再试（每小时限制 3 封）"
- **User already registered** → "该邮箱已被注册，请直接登录"
- **Error sending confirmation email** → 显示详细的解决建议

### 改进 3：支持无验证注册

如果在 Supabase 中关闭了邮箱验证：
- 注册后立即创建用户记录
- 自动登录
- 跳转到首页

## 测试步骤

### 测试方案 1（关闭邮箱验证）

1. 在 Supabase 中关闭 "Confirm email"
2. 访问 `/login`
3. 切换到"注册"标签
4. 输入邮箱和密码
5. 点击"邮箱注册"
6. 应该显示"注册成功！正在跳转..."
7. 自动跳转到首页并登录

### 测试方案 2（配置 SMTP）

1. 配置自定义 SMTP
2. 在 Supabase 中启用 "Confirm email"
3. 访问 `/login`
4. 切换到"注册"标签
5. 输入邮箱和密码
6. 点击"邮箱注册"
7. 应该显示"注册成功！请检查邮箱验证链接"
8. 检查邮箱，应该收到验证邮件
9. 点击验证链接
10. 自动登录并跳转到首页

## 手动验证用户（临时方案）

如果用户已注册但邮件发送失败，可以手动验证：

1. 访问 Supabase Dashboard
2. 进入 **Authentication** > **Users**
3. 找到对应的用户
4. 点击用户进入详情页
5. 找到 "Email Confirmed" 字段
6. 点击 "Confirm Email"

## 常见问题

### Q: 为什么默认 SMTP 有限制？

A: Supabase 的默认 SMTP 是共享服务，为了防止滥用，限制每小时 3 封邮件。生产环境建议使用自定义 SMTP。

### Q: 关闭邮箱验证安全吗？

A: 开发环境可以关闭，但生产环境建议启用：
- ✅ 开发环境：关闭（方便测试）
- ❌ 生产环境：启用（防止垃圾注册）

### Q: 如何测试邮件发送？

A: 使用 Mailtrap（测试专用）：
```
Host: smtp.mailtrap.io
Port: 587
Username: [from mailtrap]
Password: [from mailtrap]
```

所有邮件会被拦截到 Mailtrap，不会真正发送。

### Q: 用户已注册但无法登录？

A: 如果启用了邮箱验证但邮件发送失败：
1. 在 Supabase Dashboard 手动验证用户
2. 或者关闭邮箱验证要求
3. 或者配置自定义 SMTP 后让用户重新注册

## 推荐配置

### 开发环境
```
✅ 关闭邮箱验证
✅ 使用默认 SMTP（或不发送邮件）
✅ 快速测试
```

### 生产环境
```
✅ 启用邮箱验证
✅ 配置自定义 SMTP（Resend/SendGrid）
✅ 自定义邮件模板
✅ 配置正确的 Site URL
```

## 总结

最快的解决方案：
1. 在 Supabase Dashboard 中关闭 "Confirm email"
2. 重新测试注册
3. 应该可以立即注册并登录

如果需要邮箱验证功能，配置自定义 SMTP 服务。
