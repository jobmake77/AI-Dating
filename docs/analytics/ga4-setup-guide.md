# Google Analytics 4 设置指南

本指南将帮助您为 AI-Dating 项目创建和配置 Google Analytics 4。

---

## 第一步：创建 Google Analytics 账户

### 1. 访问 Google Analytics
前往 [Google Analytics](https://analytics.google.com/)

### 2. 创建账户
1. 点击"开始测量"或"创建账户"
2. 输入账户名称：`AI-Dating`
3. 配置账户数据共享设置（根据需要选择）
4. 点击"下一步"

---

## 第二步：创建媒体资源（Property）

### 1. 媒体资源设置
- **媒体资源名称**: `AI-Dating Production`
- **报告时区**: 选择您的时区（例如：`(GMT+08:00) 中国时间 - 北京`）
- **货币**: 选择 `人民币 (CNY ¥)` 或您使用的货币

### 2. 关于您的业务
- **行业类别**: 选择 `技术` 或 `在线社区`
- **业务规模**: 选择适合的规模（例如：`小型 - 1 到 10 名员工`）
- **使用 Google Analytics 的目的**:
  - ✅ 衡量用户行为
  - ✅ 获取客户洞察
  - ✅ 优化用户体验

### 3. 点击"创建"并接受服务条款

---

## 第三步：设置数据流（Data Stream）

### 1. 选择平台
选择 **"网站"**

### 2. 设置网站数据流
- **网站网址**:
  - 生产环境：`https://your-domain.com`（替换为您的实际域名）
  - 开发环境：`http://localhost:3000`（可选，用于测试）
- **数据流名称**: `AI-Dating Web`

### 3. 增强型衡量
建议启用以下选项（默认已启用）：
- ✅ 网页浏览量
- ✅ 滚动次数
- ✅ 出站点击次数
- ✅ 网站搜索
- ✅ 视频互动
- ✅ 文件下载

### 4. 点击"创建数据流"

---

## 第四步：获取 Measurement ID

创建数据流后，您将看到：

```
衡量 ID
G-XXXXXXXXXX
```

**这就是您需要的 Measurement ID！**

复制这个 ID（格式：`G-XXXXXXXXXX`）

---

## 第五步：配置 AI-Dating 项目

### 1. 添加环境变量

在项目根目录创建或编辑 `.env.local` 文件：

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**重要**: 将 `G-XXXXXXXXXX` 替换为您在第四步获取的实际 Measurement ID

### 2. 更新 .env.example

为了让团队成员知道需要配置 GA4，更新 `.env.example`：

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. 重启开发服务器

```bash
npm run dev
```

---

## 第六步：验证配置

### 1. 访问您的网站
在浏览器中打开 `http://localhost:3000`

### 2. 检查 GA4 实时报告
1. 返回 Google Analytics
2. 在左侧菜单中选择 **"报告" > "实时"**
3. 您应该能看到当前的活跃用户（您自己）

### 3. 检查浏览器控制台
打开浏览器开发者工具（F12），在 Network 标签中：
- 筛选 `google-analytics` 或 `gtag`
- 您应该能看到发送到 GA4 的请求

---

## 第七步：配置自定义事件（可选）

### 1. 在 GA4 中创建自定义维度

为了更好地分析用户行为，建议创建以下自定义维度：

1. 进入 **"管理" > "数据显示" > "自定义定义"**
2. 点击 **"创建自定义维度"**

**推荐的自定义维度**：

| 维度名称 | 范围 | 事件参数 | 描述 |
|---------|------|---------|------|
| User Role | 用户 | user_role | 用户角色（user/creator/admin） |
| Membership Tier | 用户 | membership_tier | 会员等级（free/premium） |
| Content Type | 事件 | content_type | 内容类型 |
| Event Type | 事件 | event_type | 活动类型 |

### 2. 创建自定义指标

1. 进入 **"管理" > "数据显示" > "自定义定义"**
2. 点击 **"创建自定义指标"**

**推荐的自定义指标**：

| 指标名称 | 范围 | 事件参数 | 单位 |
|---------|------|---------|------|
| Token Amount | 事件 | token_amount | 标准 |
| API Call Count | 事件 | api_call_count | 标准 |

---

## 第八步：设置转化事件

### 1. 标记关键事件为转化

1. 进入 **"管理" > "数据显示" > "事件"**
2. 等待事件开始出现（可能需要几小时）
3. 将以下事件标记为转化：
   - `user_signed_up` - 用户注册
   - `membership_purchased` - 购买会员
   - `first_post_published` - 首次发布内容
   - `api_key_created` - 创建 API Key

---

## 常见问题

### Q1: 为什么实时报告中看不到数据？
**A**:
- 确保 Measurement ID 正确配置
- 检查浏览器是否安装了广告拦截插件（可能会阻止 GA4）
- 确保开发服务器已重启
- 数据可能需要几分钟才能显示

### Q2: 如何测试事件追踪？
**A**:
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 执行操作（如注册、发布内容）
4. 在 Network 标签中查看发送到 GA4 的请求
5. 在 GA4 实时报告中查看事件

### Q3: 开发环境的数据会影响生产数据吗？
**A**:
建议为开发环境创建单独的 GA4 媒体资源：
- 生产环境：`AI-Dating Production` (G-XXXXXXXXXX)
- 开发环境：`AI-Dating Development` (G-YYYYYYYYYY)

在 `.env.local` 中使用开发环境的 ID，在生产环境变量中使用生产环境的 ID。

### Q4: 如何排除内部流量？
**A**:
1. 进入 **"管理" > "数据流" > "配置标记设置"**
2. 点击 **"显示高级设置"**
3. 添加 **"定义内部流量"**
4. 输入您的 IP 地址或 IP 范围

### Q5: 数据保留期限是多久？
**A**:
默认为 2 个月，可以在 **"管理" > "数据设置" > "数据保留"** 中修改为 14 个月。

---

## 进阶配置

### 1. 设置 Google Tag Manager（可选）
如果需要更灵活的标签管理，可以使用 GTM：
- [Google Tag Manager 设置指南](https://tagmanager.google.com/)

### 2. 连接 Google Search Console
将 GA4 与 Search Console 连接以获取搜索数据：
1. 进入 **"管理" > "产品关联" > "Search Console 关联"**
2. 点击 **"关联"** 并选择您的 Search Console 媒体资源

### 3. 设置受众群体
创建自定义受众群体以进行再营销：
1. 进入 **"管理" > "受众群体"**
2. 点击 **"新建受众群体"**
3. 定义条件（例如：会员用户、活跃创作者）

---

## 相关资源

- [Google Analytics 4 官方文档](https://support.google.com/analytics/answer/10089681)
- [GA4 事件参考](https://support.google.com/analytics/answer/9267735)
- [GA4 最佳实践](https://support.google.com/analytics/answer/9267744)
- [Next.js Google Analytics 集成](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)

---

## 支持

如有问题，请联系：
- 技术支持：[您的邮箱]
- Google Analytics 帮助中心：https://support.google.com/analytics

---

**最后更新**: 2026-03-07
