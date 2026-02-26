# 安全问题汇总（AI-Dating）

## 范围与方法
- 范围：当前代码库的静态安全审查（Next.js App Router + React）。
- 方法：代码扫描与人工审阅；未执行实际渗透测试。

## 关键发现（按严重性）

### 1) 严重（Critical）：任意已登录用户可提升为管理员
- **位置**：`/Users/a77/Desktop/AI-Dating/app/api/admin/set-admin/route.ts`（POST）
- **证据**：接口仅校验是否登录，随后直接把 `role` 更新为 `admin`。
- **影响**：任何已登录用户可获取管理员权限。
- **修复建议**：
  - 应用层：仅允许现有管理员调用该接口。
  - 数据库层：为 `users.role` 更新添加 RLS 策略，仅管理员可更新。

### 2) 高危（High）：Markdown 预览允许原始 HTML 渲染（XSS）
- **位置**：`/Users/a77/Desktop/AI-Dating/components/content/markdown-preview.tsx`
- **证据**：`react-markdown` 使用 `rehype-raw`，允许原始 HTML。
- **影响**：若内容可被用户控制，可能造成存储型 XSS。
- **修复建议**：移除 `rehype-raw`，或改用严格白名单消毒后再渲染。

## 中危（Medium）

### 3) OAuth 回调日志与重定向使用请求来源
- **位置**：`/Users/a77/Desktop/AI-Dating/app/auth/callback/route.ts`
- **证据**：记录 auth code 相关日志；使用 `requestUrl.origin` 构造重定向。
- **影响**：可能泄露敏感信息；Host Header 注入可能影响重定向目标。
- **修复建议**：移除敏感日志；使用配置项（如 `NEXT_PUBLIC_SITE_URL`）作为唯一来源。

### 4) 图片上传仅依赖客户端 MIME 类型
- **位置**：`/Users/a77/Desktop/AI-Dating/lib/cloudflare/r2.ts`
- **证据**：仅校验 `file.type`。
- **影响**：类型可伪造，可能上传恶意内容并公开访问。
- **修复建议**：服务端做内容嗅探或二次转码，必要时以附件方式下载。

### 5) 视频上传预签名仅依赖客户端 MIME 类型
- **位置**：`/Users/a77/Desktop/AI-Dating/lib/actions/upload-video.ts`
- **证据**：仅校验 `contentType`。
- **影响**：类型可伪造，可能上传非视频内容。
- **修复建议**：上传后做服务端校验或转码，公开前验证对象内容。

## 备注
- 未在代码中发现 CSP/安全响应头配置；如在边缘层配置，请确认已生效。
- Supabase 采用 Cookie 会话时，需关注跨站请求防护（CSRF）。

## 参考报告
- `/Users/a77/Desktop/AI-Dating/security_best_practices_report.md`
