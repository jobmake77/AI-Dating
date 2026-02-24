# SEO 优化指南

本文档说明 AI-Dating 项目的 SEO 优化实施情况。

## 已实施的 SEO 优化

### 1. Meta 标签优化

#### 根 Layout (`app/layout.tsx`)
- ✅ 完整的 title 模板配置
- ✅ description 和 keywords
- ✅ Open Graph 标签（社交分享）
- ✅ Twitter Card 标签
- ✅ robots 配置
- ✅ 搜索引擎验证占位符

#### 动态页面 Metadata
- ✅ 内容详情页 (`/post/[id]`)
  - 动态 title、description
  - 文章封面图作为 OG 图片
  - 发布时间、修改时间
  - 作者信息
  - 标签关键词

- ✅ 用户主页 (`/u/[username]`)
  - 用户名、头像、简介
  - 用户统计数据
  - Profile 类型 OG 标签

- ✅ 标签页 (`/tag/[name]`)
  - 标签名称和内容数量
  - 动态 description

### 2. Sitemap 生成

**文件**: `app/sitemap.ts`

动态生成包含以下页面的 sitemap：
- 静态页面（首页、热门、搜索）
- 所有已发布的内容详情页
- 所有用户主页
- 所有标签页

**更新频率**:
- 首页: hourly
- 内容详情: weekly
- 用户主页: weekly
- 标签页: daily

**访问地址**: `https://your-domain.com/sitemap.xml`

### 3. Robots.txt

**文件**: `app/robots.ts`

配置规则：
- ✅ 允许所有爬虫访问公开页面
- ✅ 禁止访问私密页面（/api/, /admin/, /settings, /messages/）
- ✅ 指向 sitemap.xml

**访问地址**: `https://your-domain.com/robots.txt`

### 4. 结构化数据 (JSON-LD)

**文件**: `lib/seo/structured-data.ts`

实现的 Schema.org 类型：
- ✅ Organization（组织信息）
- ✅ Article（文章信息）
- ✅ Person（用户信息）

**已集成**:
- ✅ 根 layout 包含 Organization schema

**待集成**:
- ⏳ 内容详情页添加 Article schema
- ⏳ 用户主页添加 Person schema

### 5. 技术 SEO

- ✅ 语言标签: `lang="zh-CN"`
- ✅ 响应式设计（移动端友好）
- ✅ 语义化 HTML
- ✅ 图片 alt 属性
- ✅ 内部链接优化

## 环境变量配置

需要在 `.env.local` 中添加：

```bash
# 网站配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**重要**:
- 开发环境可以使用 `http://localhost:3000`
- 生产环境必须使用实际域名

## OG 图片准备

需要准备以下图片：

1. **默认 OG 图片** (`public/og-image.png`)
   - 尺寸: 1200x630px
   - 格式: PNG 或 JPG
   - 内容: AI-Dating logo + slogan

2. **Logo** (`public/logo.png`)
   - 尺寸: 512x512px
   - 格式: PNG（透明背景）
   - 用于结构化数据

## 验证清单

### 部署前检查

- [ ] 设置 `NEXT_PUBLIC_SITE_URL` 环境变量
- [ ] 准备 OG 图片和 Logo
- [ ] 测试 sitemap.xml 生成
- [ ] 测试 robots.txt 生成
- [ ] 检查所有页面的 meta 标签

### 部署后验证

- [ ] 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 验证结构化数据
- [ ] 使用 [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 验证 OG 标签
- [ ] 使用 [Twitter Card Validator](https://cards-dev.twitter.com/validator) 验证 Twitter Card
- [ ] 提交 sitemap 到 Google Search Console
- [ ] 提交 sitemap 到 Bing Webmaster Tools

## 搜索引擎提交

### Google Search Console

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 添加网站
3. 验证所有权（使用 meta 标签或 DNS）
4. 提交 sitemap: `https://your-domain.com/sitemap.xml`

### Bing Webmaster Tools

1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. 添加网站
3. 验证所有权
4. 提交 sitemap

## 性能优化建议

### 图片优化
- 使用 Next.js Image 组件
- 启用图片懒加载
- 使用 WebP 格式

### 代码优化
- 启用 gzip/brotli 压缩
- 最小化 CSS/JS
- 使用 CDN

### 缓存策略
- 设置合理的 Cache-Control headers
- 使用 ISR (Incremental Static Regeneration)

## 监控和分析

### 推荐工具

1. **Google Analytics 4**
   - 流量分析
   - 用户行为追踪

2. **Google Search Console**
   - 搜索表现
   - 索引状态
   - 移动端可用性

3. **Lighthouse**
   - 性能评分
   - SEO 评分
   - 可访问性评分

## 持续优化

### 定期检查

- 每周检查 Search Console 错误
- 每月分析搜索关键词表现
- 每季度更新 sitemap
- 根据数据优化 meta 描述

### 内容优化

- 鼓励创作者使用描述性标题
- 优化内容摘要（excerpt）
- 使用相关标签
- 添加内部链接

---

**最后更新**: 2026-02-17
**版本**: 1.0
