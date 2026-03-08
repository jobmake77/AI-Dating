# SEO 验证指南

本指南帮助你验证 AI-Dating 项目的结构化数据实现是否正确。

---

## 验证工具

### 1. Google Rich Results Test

**URL**: https://search.google.com/test/rich-results

**使用步骤**:
1. 访问 Google Rich Results Test
2. 输入要测试的 URL（必须是公开可访问的 URL）
3. 点击"测试 URL"
4. 查看结果

**预期结果**:
- ✅ 无错误
- ✅ 显示检测到的结构化数据类型
- ✅ 预览富文本片段效果

---

### 2. Schema.org Validator

**URL**: https://validator.schema.org/

**使用步骤**:
1. 访问 Schema.org Validator
2. 选择"Fetch URL"标签
3. 输入要验证的 URL
4. 点击"Run Test"

**预期结果**:
- ✅ 无错误
- ✅ 所有必需字段都存在
- ✅ 数据格式正确

---

### 3. 本地验证脚本

**使用方法**:

```bash
# 1. 启动开发服务器
npm run dev

# 2. 在另一个终端运行验证脚本
npm run validate-structured-data

# 3. 验证特定 URL
npm run validate-structured-data -- --url=http://localhost:3000/post/123
```

---

## 测试 URL 列表

### 开发环境

替换 `[ID]` 为实际的 ID：

```
http://localhost:3000/post/[内容ID]
http://localhost:3000/u/[用户名]
http://localhost:3000/events/[活动ID]
http://localhost:3000/communities/[社区slug]
```

### 生产环境

替换域名和 ID：

```
https://your-domain.com/post/[内容ID]
https://your-domain.com/u/[用户名]
https://your-domain.com/events/[活动ID]
https://your-domain.com/communities/[社区slug]
```

---

## 验证清单

### 内容详情页

- [ ] Article schema 存在
- [ ] BreadcrumbList schema 存在
- [ ] Article 包含必需字段:
  - [ ] headline
  - [ ] author
  - [ ] datePublished
  - [ ] publisher
- [ ] 面包屑导航显示正确
- [ ] 面包屑路径: 首页 > 内容 > [文章标题]

### 用户主页

- [ ] Person schema 存在
- [ ] BreadcrumbList schema 存在
- [ ] Person 包含必需字段:
  - [ ] name
  - [ ] url
- [ ] 面包屑导航显示正确
- [ ] 面包屑路径: 首页 > [用户名]

### 活动页面

- [ ] Event schema 存在
- [ ] BreadcrumbList schema 存在
- [ ] Event 包含必需字段:
  - [ ] name
  - [ ] startDate
  - [ ] location
- [ ] 面包屑导航显示正确
- [ ] 面包屑路径: 首页 > 活动 > [活动标题]

### 社区页面

- [ ] Organization schema 存在
- [ ] BreadcrumbList schema 存在
- [ ] Organization 包含必需字段:
  - [ ] name
  - [ ] url
- [ ] 面包屑导航显示正确
- [ ] 面包屑路径: 首页 > 社区 > [社区名称]

---

## 常见问题

### Q: Google Rich Results Test 显示"无法访问 URL"

**A**: 确保 URL 是公开可访问的。本地开发环境（localhost）无法被 Google 访问，需要部署到生产环境或使用 ngrok 等工具。

### Q: 结构化数据显示但有警告

**A**: 警告通常是可选字段缺失，不影响基本功能。可以根据警告信息添加更多字段以提升效果。

### Q: 面包屑导航不显示

**A**: 检查：
1. 组件是否正确导入
2. 路径是否正确
3. CSS 样式是否加载

### Q: 验证脚本报错

**A**: 确保：
1. 开发服务器正在运行
2. URL 可以访问
3. 页面包含结构化数据

---

## Google Search Console 监控

部署到生产环境后，在 Google Search Console 中监控：

1. **富文本结果报告**
   - 路径: 增强功能 > 富文本结果
   - 查看检测到的结构化数据
   - 监控错误和警告

2. **覆盖率报告**
   - 查看哪些页面被索引
   - 监控索引问题

3. **效果报告**
   - 监控点击率变化
   - 跟踪自然流量增长

---

## 下一步

验证通过后：

1. ✅ 部署到生产环境
2. ✅ 提交 sitemap 到 Google Search Console
3. ✅ 监控富文本结果报告
4. ✅ 跟踪自然流量变化
5. ✅ 根据数据优化

---

**最后更新**: 2026-03-08
