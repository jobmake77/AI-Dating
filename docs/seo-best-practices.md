# SEO 最佳实践

本文档提供 AI-Dating 项目的 SEO 最佳实践指南。

---

## 结构化数据最佳实践

### 1. 使用正确的 Schema 类型

根据内容类型选择合适的 Schema：

- **文章/博客**: Article
- **用户资料**: Person / ProfilePage
- **活动**: Event
- **组织/社区**: Organization
- **产品**: Product
- **评论**: Review
- **常见问题**: FAQPage
- **教程**: HowTo

### 2. 包含所有必需字段

每种 Schema 类型都有必需字段，确保全部包含：

**Article**:
- headline (标题)
- author (作者)
- datePublished (发布日期)
- publisher (发布者)

**Person**:
- name (姓名)

**Event**:
- name (名称)
- startDate (开始时间)
- location (地点)

**Organization**:
- name (名称)

### 3. 添加推荐字段

虽然不是必需，但推荐字段能提升富文本片段效果：

**Article**:
- image (封面图)
- description (描述)
- keywords (关键词)
- dateModified (修改日期)

**Person**:
- image (头像)
- description (简介)
- url (个人主页)
- sameAs (社交媒体链接)

**Event**:
- image (封面图)
- description (描述)
- organizer (组织者)
- offers (票务信息)

### 4. 使用 JSON-LD 格式

推荐使用 JSON-LD 格式嵌入结构化数据：

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

**优点**:
- 易于维护
- 不影响页面布局
- Google 推荐

---

## 面包屑导航最佳实践

### 1. 保持层级清晰

面包屑应该反映真实的页面层级：

```
首页 > 分类 > 子分类 > 当前页面
```

### 2. 使用语义化 HTML

```tsx
<nav aria-label="breadcrumb">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页面</li>
  </ol>
</nav>
```

### 3. 添加结构化数据

面包屑导航应该同时有 UI 和结构化数据：

```tsx
// UI
<Breadcrumb>...</Breadcrumb>

// 结构化数据
<script type="application/ld+json">
  {JSON.stringify(breadcrumbSchema)}
</script>
```

### 4. 移动端优化

在移动端考虑使用省略号或折叠长路径：

```
首页 > ... > 当前页面
```

---

## 内容优化最佳实践

### 1. 标题优化

- 使用描述性标题
- 包含关键词
- 长度控制在 50-60 字符
- 每个页面标题唯一

### 2. 描述优化

- 简洁明了
- 包含关键词
- 长度控制在 150-160 字符
- 吸引用户点击

### 3. 图片优化

- 使用描述性文件名
- 添加 alt 属性
- 压缩图片大小
- 使用 WebP 格式
- 提供多种尺寸

### 4. URL 优化

- 使用语义化 URL
- 包含关键词
- 使用连字符分隔
- 避免特殊字符
- 保持简短

**好的 URL**:
```
/post/how-to-use-ai-dating
/u/john-doe
/events/ai-conference-2026
```

**不好的 URL**:
```
/post/123456
/user?id=789
/event.php?id=456&type=conference
```

---

## 技术 SEO 最佳实践

### 1. 页面性能

- Lighthouse 分数 > 90
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 2. 移动端优化

- 响应式设计
- 移动端友好
- 触摸目标足够大
- 避免横向滚动

### 3. 网站地图

定期更新 sitemap.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/post/123</loc>
    <lastmod>2026-03-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 4. Robots.txt

配置 robots.txt 控制爬虫：

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

---

## 内容策略最佳实践

### 1. 关键词研究

- 使用 Google Keyword Planner
- 分析竞争对手
- 关注长尾关键词
- 考虑用户意图

### 2. 内容质量

- 原创内容
- 有价值的信息
- 定期更新
- 避免重复内容

### 3. 内部链接

- 相关内容互链
- 使用描述性锚文本
- 避免过度链接
- 保持链接有效

### 4. 外部链接

- 链接到权威网站
- 使用 rel="nofollow" 控制权重
- 定期检查死链

---

## 监控和分析

### 1. Google Search Console

监控指标：
- 索引覆盖率
- 富文本结果
- 核心网页指标
- 移动端可用性

### 2. Google Analytics

跟踪指标：
- 自然流量
- 跳出率
- 页面停留时间
- 转化率

### 3. 定期审计

每月检查：
- 结构化数据错误
- 页面性能
- 死链
- 重复内容

---

## 避免的错误

### 1. 结构化数据错误

❌ 不要：
- 使用虚假数据
- 隐藏结构化数据
- 标记不可见内容
- 使用错误的 Schema 类型

✅ 应该：
- 使用真实数据
- 标记可见内容
- 选择正确的 Schema
- 定期验证

### 2. 内容错误

❌ 不要：
- 关键词堆砌
- 复制内容
- 隐藏文本
- 使用误导性标题

✅ 应该：
- 自然使用关键词
- 创作原创内容
- 内容与标题一致
- 提供真实价值

### 3. 技术错误

❌ 不要：
- 阻止爬虫访问
- 使用 Flash
- 过多重定向
- 慢速加载

✅ 应该：
- 允许爬虫访问
- 使用现代技术
- 最小化重定向
- 优化性能

---

## 资源链接

### 官方文档

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)

### 工具

- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema Markup Validator](https://validator.schema.org/)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)

### 学习资源

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Ahrefs SEO Blog](https://ahrefs.com/blog/)

---

## 总结

SEO 是一个持续的过程，需要：

1. ✅ 正确实现结构化数据
2. ✅ 优化内容质量
3. ✅ 提升页面性能
4. ✅ 定期监控和分析
5. ✅ 根据数据优化

遵循这些最佳实践，AI-Dating 项目将获得更好的搜索引擎排名和自然流量。

---

**最后更新**: 2026-03-08
