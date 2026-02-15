# Cloudflare R2 配置指南

## 1. 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单选择 **R2**
3. 点击 **Create bucket**
4. 输入存储桶名称（例如：`ai-dating-images`）
5. 选择区域（建议选择离用户最近的区域）
6. 点击 **Create bucket**

## 2. 获取 API 凭证

1. 在 R2 页面，点击 **Manage R2 API Tokens**
2. 点击 **Create API token**
3. 配置权限：
   - **Token name**: `ai-dating-upload`
   - **Permissions**: 选择 **Object Read & Write**
   - **TTL**: 选择 **Forever** 或设置过期时间
4. 点击 **Create API Token**
5. **重要**：复制并保存以下信息（只显示一次）：
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

## 3. 配置公共访问

### 方式 A：使用 R2.dev 子域名（免费，快速）

1. 在存储桶设置中，找到 **Public access**
2. 点击 **Allow Access**
3. 复制 R2.dev URL（格式：`https://pub-xxxxx.r2.dev`）

### 方式 B：使用自定义域名（推荐生产环境）

1. 在存储桶设置中，点击 **Connect Domain**
2. 输入你的域名（例如：`cdn.yourdomain.com`）
3. 按照提示添加 DNS 记录
4. 等待 DNS 生效（通常几分钟）

## 4. 更新环境变量

编辑 `.env.local` 文件，填入以下信息：

```bash
# Cloudflare R2 配置
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=ai-dating-images
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # 或你的自定义域名
```

**注意**：
- `R2_ENDPOINT` 格式：`https://<account-id>.r2.cloudflarestorage.com`
- `R2_PUBLIC_URL` 是用户访问图片的公开 URL
- 不要将 `.env.local` 提交到 Git

## 5. 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

## 6. 测试图片上传

1. 访问 http://localhost:3000/create
2. 点击编辑器工具栏的图片图标
3. 选择一张图片上传
4. 图片应该会自动插入到编辑器中

## 常见问题

### Q: 上传失败，提示 "Access Denied"
A: 检查 API Token 权限是否包含 Object Read & Write

### Q: 图片上传成功但无法显示
A: 检查存储桶是否开启了公共访问（Public Access）

### Q: 提示 "Endpoint not found"
A: 检查 R2_ENDPOINT 格式是否正确，应该包含你的 Account ID

### Q: 如何查看已上传的图片？
A: 在 Cloudflare Dashboard > R2 > 你的存储桶 > Objects

## 成本说明

Cloudflare R2 免费额度：
- **存储**: 10 GB/月
- **Class A 操作**（上传）: 100 万次/月
- **Class B 操作**（下载）: 1000 万次/月
- **出站流量**: 免费（这是 R2 的最大优势）

对于 MVP 阶段完全够用！

## 安全建议

1. **不要**将 API 凭证提交到 Git
2. 生产环境使用自定义域名 + CDN
3. 定期轮换 API Token
4. 设置合理的 CORS 策略
5. 考虑添加图片压缩和格式转换
