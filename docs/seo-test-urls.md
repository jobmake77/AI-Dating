# SEO 测试 URL 列表

本文档提供用于 Google Rich Results 测试的 URL 列表。

---

## 使用说明

1. 部署项目到生产环境
2. 替换下面的 `your-domain.com` 为实际域名
3. 替换 `[ID]` 为实际存在的数据 ID
4. 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 测试每个 URL

---

## 测试 URL

### 1. 内容详情页 (Article Schema)

**测试 URL**:
```
https://your-domain.com/post/[实际内容ID]
```

**预期结果**:
- ✅ Article Schema
- ✅ BreadcrumbList Schema
- ✅ 显示作者、发布日期、封面图
- ✅ 面包屑: 首页 > 内容 > [文章标题]

**示例**:
```
https://your-domain.com/post/abc123
```

---

### 2. 用户主页 (Person Schema)

**测试 URL**:
```
https://your-domain.com/u/[实际用户名]
```

**预期结果**:
- ✅ Person Schema
- ✅ BreadcrumbList Schema
- ✅ 显示用户头像、简介
- ✅ 面包屑: 首页 > [用户名]

**示例**:
```
https://your-domain.com/u/johndoe
```

---

### 3. 活动页面 (Event Schema)

**测试 URL**:
```
https://your-domain.com/events/[实际活动ID]
```

**预期结果**:
- ✅ Event Schema
- ✅ BreadcrumbList Schema
- ✅ 显示活动时间、地点、参与人数
- ✅ 面包屑: 首页 > 活动 > [活动标题]

**示例**:
```
https://your-domain.com/events/event123
```

---

### 4. 社区页面 (Organization Schema)

**测试 URL**:
```
https://your-domain.com/communities/[实际社区slug]
```

**预期结果**:
- ✅ Organization Schema
- ✅ BreadcrumbList Schema
- ✅ 显示社区描述、成员数
- ✅ 面包屑: 首页 > 社区 > [社区名称]

**示例**:
```
https://your-domain.com/communities/ai-developers
```

---

## 验证步骤

### 步骤 1: 准备测试数据

确保数据库中有以下测试数据：
- [ ] 至少 1 篇已发布的内容
- [ ] 至少 1 个用户资料
- [ ] 至少 1 个活动
- [ ] 至少 1 个社区

### 步骤 2: 获取实际 URL

1. 访问生产环境网站
2. 浏览到各个页面
3. 复制实际的 URL

### 步骤 3: Google Rich Results Test

对每个 URL：
1. 访问 https://search.google.com/test/rich-results
2. 粘贴 URL
3. 点击"测试 URL"
4. 等待结果
5. 检查是否有错误或警告

### 步骤 4: 记录结果

| 页面类型 | URL | 状态 | Schema 类型 | 备注 |
|---------|-----|------|------------|------|
| 内容详情页 | | ⏳ | Article, BreadcrumbList | |
| 用户主页 | | ⏳ | Person, BreadcrumbList | |
| 活动页面 | | ⏳ | Event, BreadcrumbList | |
| 社区页面 | | ⏳ | Organization, BreadcrumbList | |

---

## 本地测试

在部署前，可以在本地测试：

```bash
# 启动开发服务器
npm run dev

# 访问测试 URL
http://localhost:3000/post/[ID]
http://localhost:3000/u/[username]
http://localhost:3000/events/[ID]
http://localhost:3000/communities/[slug]

# 查看源代码，搜索 "application/ld+json"
# 确认结构化数据存在
```

---

## 常见问题

### Q: Google Rich Results Test 显示"无法访问 URL"

**A**: 确保：
- URL 是公开可访问的
- 没有被 robots.txt 阻止
- 服务器正常运行
- 没有需要登录才能访问

### Q: 显示警告但没有错误

**A**: 警告通常是可选字段缺失，不影响基本功能。可以根据警告添加更多字段。

### Q: 结构化数据不显示

**A**: 检查：
- 页面是否正确渲染
- JSON-LD 脚本是否存在
- JSON 格式是否正确
- 浏览器控制台是否有错误

---

## 提交到 Google Search Console

验证通过后：

1. 登录 [Google Search Console](https://search.google.com/search-console)
2. 添加网站属性
3. 验证所有权
4. 提交 sitemap: `https://your-domain.com/sitemap.xml`
5. 等待 Google 索引
6. 监控"增强功能"报告

---

## 监控指标

在 Google Search Console 中监控：

- **富文本结果**: 增强功能 > 富文本结果
- **覆盖率**: 查看索引状态
- **效果**: 监控点击率和展示次数
- **核心网页指标**: 检查性能

---

**最后更新**: 2026-03-08
