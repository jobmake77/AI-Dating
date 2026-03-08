# 数据看板快速开始指南

本指南帮助您快速启动 AI-Dating 数据看板功能。

---

## 🚀 快速开始（5 分钟）

### 步骤 1: 运行数据库迁移

在 Supabase Dashboard 中执行数据库迁移：

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择您的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New query**
5. 复制 `supabase/migrations/026_create_analytics_events.sql` 的内容
6. 粘贴到编辑器中
7. 点击 **Run** 执行

**验证**: 在 **Table Editor** 中应该能看到新表 `analytics_events`

---

### 步骤 2: 配置 Google Analytics 4（可选）

如果您想使用 GA4 追踪：

1. 按照 `docs/analytics/ga4-setup-guide.md` 创建 GA4 账户
2. 获取 Measurement ID（格式：`G-XXXXXXXXXX`）
3. 在项目根目录的 `.env.local` 文件中添加：
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. 重启开发服务器：
   ```bash
   npm run dev
   ```

**跳过 GA4**: 如果暂时不配置 GA4，数据看板仍然可以正常工作，事件会存储在数据库中。

---

### 步骤 3: 访问数据看板

1. 启动开发服务器（如果还没启动）：
   ```bash
   npm run dev
   ```

2. 使用管理员账户登录

3. 访问数据看板：
   ```
   http://localhost:3000/admin/analytics
   ```

4. 您应该能看到：
   - 概览 Tab：统计卡片、增长趋势图、热门内容
   - 用户分析 Tab：用户增长、留存率
   - 会员分析 Tab：会员统计、会员管理

---

## 📊 功能说明

### 概览 Tab
- **统计卡片**: 总用户数、DAU/WAU/MAU、总内容数、会员数
- **增长趋势图**: 近 30 天用户和内容增长曲线
- **热门内容**: Top 10 最受欢迎的内容

### 用户分析 Tab
- **用户增长趋势**: 近 30 天新增用户曲线
- **用户留存率**: 按周群组统计 D1/D7/D30 留存
- **活跃度指标**: DAU/WAU/MAU 及占比

### 会员分析 Tab
- **会员统计**: 总会员、本月新增、转化率、流失率
- **会员增长趋势**: 新增会员和累计会员曲线
- **会员管理**: 整合的会员管理表格（更新会员状态、角色）

---

## 🎯 事件追踪说明

系统已自动追踪以下事件：

### 用户相关
- ✅ 用户注册 (`user_signed_up`)
- ✅ 用户登录 (`user_logged_in`)
- ✅ 升级为创作者 (`user_upgraded_to_creator`)

### 内容相关
- ✅ 首次发布内容 (`first_post_published`)
- ✅ 发布内容 (`post_published`)
- ✅ 点赞内容 (`post_liked`)
- ✅ 取消点赞 (`post_unliked`)
- ✅ 评论内容 (`post_commented`)

### 会员相关
- ✅ 购买会员 (`membership_purchased`)
- ✅ 取消会员 (`membership_cancelled`)

所有事件都会：
1. 存储到数据库 `analytics_events` 表（保留 90 天）
2. 发送到 Google Analytics 4（如果已配置）

---

## 🔍 查看事件日志

### 在 Supabase 中查看

1. 登录 Supabase Dashboard
2. 点击 **Table Editor**
3. 选择 `analytics_events` 表
4. 查看所有事件记录

### 在 GA4 中查看

1. 登录 [Google Analytics](https://analytics.google.com/)
2. 选择您的媒体资源
3. 点击 **报告 > 实时** 查看实时事件
4. 点击 **报告 > 互动 > 事件** 查看历史事件

---

## 🐛 故障排除

### 问题 1: 数据看板显示"暂无数据"

**原因**: 数据库中还没有足够的数据

**解决方案**:
1. 确保数据库迁移已执行
2. 执行一些操作（注册、发布内容、点赞等）
3. 等待几分钟后刷新页面

### 问题 2: GA4 实时报告中看不到数据

**原因**: GA4 配置不正确或被广告拦截插件阻止

**解决方案**:
1. 检查 `.env.local` 中的 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 是否正确
2. 重启开发服务器
3. 禁用浏览器的广告拦截插件
4. 打开浏览器开发者工具（F12），在 Network 标签中查看是否有发送到 `google-analytics.com` 的请求

### 问题 3: 数据看板加载很慢

**原因**: 数据量大或查询未优化

**解决方案**:
1. 检查数据库索引是否正确创建
2. 在 Supabase Dashboard 的 **Database > Indexes** 中验证索引
3. 如果数据量很大，考虑添加数据分页

### 问题 4: 留存率显示为 0%

**原因**: 需要至少 7-30 天的数据积累

**解决方案**:
- 留存率计算需要时间，初期数据不完整是正常的
- 等待用户活跃一段时间后，留存率会逐渐准确

---

## 📈 数据积累建议

为了获得有意义的数据分析：

### 第 1 天
- ✅ 完成数据库迁移
- ✅ 配置 GA4（可选）
- ✅ 测试事件追踪

### 第 1 周
- 📊 观察用户增长趋势
- 📊 查看热门内容
- 📊 监控会员转化

### 第 1 个月
- 📊 分析用户留存率（D7/D30）
- 📊 评估会员流失率
- 📊 优化内容策略

---

## 🎓 进阶使用

### 自定义事件追踪

如果需要追踪自定义事件，参考以下代码：

```typescript
// 服务端（Server Actions）
import { trackEvent } from '@/lib/analytics/events'

await trackEvent('custom_event_name', {
  custom_param_1: 'value1',
  custom_param_2: 123,
})

// 客户端（React Components）
'use client'
import { useAnalytics } from '@/lib/analytics/use-analytics'

function MyComponent() {
  const { trackEvent } = useAnalytics()

  const handleClick = () => {
    trackEvent('button_clicked', {
      button_name: 'submit',
    })
  }

  return <button onClick={handleClick}>Submit</button>
}
```

### 导出数据

从 Supabase 导出事件数据：

```sql
-- 导出最近 30 天的事件
SELECT *
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- 按事件类型统计
SELECT
  event_name,
  COUNT(*) as count
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY count DESC;
```

---

## 📚 相关文档

- [GA4 设置指南](./ga4-setup-guide.md) - 详细的 Google Analytics 4 配置步骤
- [实施报告](./implementation-report.md) - 完整的实施细节和技术说明
- [事件类型定义](../../lib/analytics/types.ts) - 所有可追踪的事件类型

---

## 💡 提示

1. **数据隐私**: 不要在事件参数中记录敏感信息（密码、Token、个人身份信息）
2. **性能优化**: 事件追踪是异步的，不会阻塞主流程
3. **数据保留**: 数据库中的事件日志保留 90 天，GA4 免费版保留 2 个月
4. **定期清理**: 系统会自动清理 90 天前的事件日志

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 [实施报告](./implementation-report.md) 了解技术细节
2. 检查浏览器控制台是否有错误信息
3. 查看 Supabase Dashboard 的日志
4. 联系技术支持

---

**祝您使用愉快！** 🎉
