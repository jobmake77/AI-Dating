# Supabase 邮箱认证配置指南

## 问题
添加了邮箱登录功能，但 Supabase 中没有启用邮箱认证，导致无法使用。

## 解决方案

### 步骤 1：启用邮箱认证

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Providers**
4. 找到 **Email** provider
5. 确保 **Enable Email provider** 开关是打开的 ✅

### 步骤 2：配置邮箱设置

在同一页面，配置以下选项：

#### a. Confirm email（邮箱验证）
- **推荐设置：** 开启 ✅
- **说明：** 用户注册后需要验证邮箱才能登录
- **好处：** 防止垃圾注册，确保邮箱真实性

#### b. Secure email change（安全邮箱更改）
- **推荐设置：** 开启 ✅
- **说明：** 更改邮箱时需要验证新旧邮箱
- **好处：** 防止账号被盗

#### c. Double confirm email changes（双重确认邮箱更改）
- **推荐设置：** 开启 ✅
- **说明：** 更改邮箱时需要确认两次
- **好处：** 额外的安全保护

### 步骤 3：配置 SMTP（可选但推荐）

默认情况下，Supabase 使用内置的邮件服务，但有限制（每小时 3 封邮件）。

#### 使用自定义 SMTP

1. 进入 **Project Settings** > **Auth**
2. 滚动到 **SMTP Settings**
3. 启用 **Enable Custom SMTP**
4. 填写以下信息：

```
Host: smtp.gmail.com (或其他 SMTP 服务器)
Port: 587
Username: your-email@gmail.com
Password: your-app-password
Sender email: your-email@gmail.com
Sender name: AI-Dating
```

#### 推荐的 SMTP 服务

1. **Gmail**
   - Host: `smtp.gmail.com`
   - Port: `587`
   - 需要创建应用专用密码

2. **SendGrid**
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - 免费额度：100 封/天

3. **Mailgun**
   - Host: `smtp.mailgun.org`
   - Port: `587`
   - 免费额度：5000 封/月

4. **Resend**
   - Host: `smtp.resend.com`
   - Port: `587`
   - 免费额度：3000 封/月

### 步骤 4：配置邮件模板（可选）

1. 进入 **Authentication** > **Email Templates**
2. 自定义以下模板：
   - **Confirm signup** - 注册验证邮件
   - **Magic Link** - 魔法链接登录
   - **Change Email Address** - 更改邮箱
   - **Reset Password** - 重置密码

#### 示例：注册验证邮件模板

```html
<h2>欢迎加入 AI-Dating！</h2>
<p>感谢注册 AI-Dating 社区。</p>
<p>请点击下面的链接验证你的邮箱：</p>
<p><a href="{{ .ConfirmationURL }}">验证邮箱</a></p>
<p>如果你没有注册 AI-Dating，请忽略此邮件。</p>
```

### 步骤 5：配置 URL 设置

1. 进入 **Authentication** > **URL Configuration**
2. 配置以下 URL：

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000
  - http://localhost:3000/auth/callback
  - http://localhost:3000/**
```

**生产环境：**
```
Site URL: https://your-domain.com
Redirect URLs:
  - https://your-domain.com
  - https://your-domain.com/auth/callback
  - https://your-domain.com/**
```

## 测试邮箱登录

### 测试注册

1. 访问 `/login`
2. 切换到"注册"标签
3. 输入邮箱和密码（至少 6 个字符）
4. 点击"邮箱注册"
5. 检查邮箱，应该收到验证邮件
6. 点击验证链接
7. 自动登录并跳转到首页

### 测试登录

1. 访问 `/login`
2. 在"登录"标签下输入邮箱和密码
3. 点击"邮箱登录"
4. 应该自动跳转到首页

## 常见问题

### Q1: 没有收到验证邮件？

**检查：**
1. 垃圾邮件文件夹
2. Supabase Dashboard > Logs 查看是否有错误
3. 确认 SMTP 配置正确
4. 检查邮箱地址是否正确

**解决方案：**
- 使用自定义 SMTP 服务
- 检查 SMTP 服务的发送限制
- 查看 Supabase 日志

### Q2: 注册时提示"Email rate limit exceeded"？

**原因：** 使用默认 SMTP，每小时限制 3 封邮件

**解决方案：**
- 配置自定义 SMTP 服务
- 等待 1 小时后重试

### Q3: 登录时提示"Invalid login credentials"？

**可能原因：**
1. 邮箱或密码错误
2. 邮箱未验证（如果启用了邮箱验证）
3. 用户不存在

**解决方案：**
- 检查邮箱和密码是否正确
- 确认邮箱已验证
- 重新注册

### Q4: 如何禁用邮箱验证（开发环境）？

**步骤：**
1. 进入 **Authentication** > **Providers** > **Email**
2. 关闭 **Confirm email** 开关
3. 保存

**注意：** 生产环境建议启用邮箱验证

### Q5: 如何测试邮件发送？

**方法 1：使用 Mailtrap（推荐）**
```
Host: smtp.mailtrap.io
Port: 587
Username: [from mailtrap]
Password: [from mailtrap]
```

**方法 2：使用 Gmail**
1. 启用两步验证
2. 创建应用专用密码
3. 使用应用密码作为 SMTP 密码

## 快速配置（开发环境）

如果你只是想快速测试，可以：

1. **禁用邮箱验证**
   - Authentication > Providers > Email
   - 关闭 "Confirm email"

2. **使用默认 SMTP**
   - 不配置自定义 SMTP
   - 注意每小时 3 封邮件限制

3. **测试登录**
   - 注册后立即可以登录
   - 无需验证邮箱

## 生产环境配置

生产环境建议：

1. ✅ 启用邮箱验证
2. ✅ 配置自定义 SMTP
3. ✅ 自定义邮件模板
4. ✅ 配置正确的 Site URL 和 Redirect URLs
5. ✅ 启用安全邮箱更改
6. ✅ 启用双重确认邮箱更改

## 总结

邮箱登录功能已经在代码中实现，但需要在 Supabase Dashboard 中进行配置：

1. **必须：** 启用 Email provider
2. **推荐：** 配置自定义 SMTP（避免发送限制）
3. **可选：** 自定义邮件模板
4. **必须：** 配置正确的 URL 设置

配置完成后，邮箱登录功能就可以正常使用了！
