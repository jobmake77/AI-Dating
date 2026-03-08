# AI-Dating 任务清单

**创建日期**: 2026-02-14
**当前阶段**: Day 1 - 基础搭建

---

## Day 1: 技术选型与基础搭建

### 已完成 ✅

- [x] 初始化 Next.js 项目
- [x] 配置 TypeScript
- [x] 配置 Tailwind CSS
- [x] 创建基础页面结构
- [x] 开发服务器运行正常
- [x] 创建项目文档
  - [x] MVP 功能规格
  - [x] 5 天发布计划
  - [x] 商业模式画布
  - [x] 内容审核政策
  - [x] 盈亏平衡分析
  - [x] 项目状态文档
  - [x] CLAUDE.md 工作指南

### 进行中 🔄

- [x] 配置 Supabase ✅
  - [x] 安装 Supabase 客户端库
  - [x] 创建 Supabase 配置文件
  - [x] 创建环境变量模板
  - [x] 创建 middleware
  - [x] 创建 Supabase 项目
  - [x] 获取 API 密钥
  - [x] 配置环境变量

- [x] 创建数据库 Schema ✅
  - [x] 用户表（users）
  - [x] 内容表（contents）
  - [x] 审核记录表（moderation_logs）
  - [x] 订阅记录表（subscriptions）
  - [x] RLS 策略
  - [x] 索引优化
  - [x] 在 Supabase 中执行 SQL

- [x] 安装 shadcn/ui ✅
  - [x] 初始化 shadcn/ui
  - [x] 安装基础组件（Button, Input, Card）
  - [x] 配置主题
  - [x] 更新首页展示

- [x] 实现 GitHub OAuth 登录 ✅
  - [x] 配置 Supabase Auth
  - [x] 创建 GitHub OAuth App
  - [x] 实现登录页面
  - [x] 实现登录逻辑（Server Actions）
  - [x] 实现登出功能
  - [x] 用户自动创建到数据库
  - [x] 测试登录流程

- [x] 创建导航栏组件
- [x] 创建页脚组件
- [x] 设置全局布局

---

## Day 2: 核心功能开发

### 已完成 ✅

- [x] 用户个人主页优化
  - [x] 用户信息展示（头像、姓名、用户名、简介）
  - [x] 统计数据（关注、粉丝、内容数、获赞数）
  - [x] 社交链接（GitHub）
  - [x] 加入时间显示
  - [x] 内容标签页（内容/点赞/转发切换）
  - [x] 响应式设计优化

- [x] 内容列表页（Twitter 风格）
  - [x] 内容卡片组件（Twitter 风格设计）
  - [x] 分页功能
  - [x] 作者头像和信息
  - [x] 互动统计（点赞/转发/评论）
  - [x] 悬停效果优化

- [x] 内容详情页
  - [x] Markdown 渲染（Prose 样式）
  - [x] 代码块样式优化
  - [x] 作者信息卡片
  - [x] 评论系统
  - [x] 互动按钮（点赞/转发/评论）
  - [x] Twitter 风格布局

- [x] UI/UX 优化
  - [x] 卡片设计优化（阴影、圆角、间距）
  - [x] Twitter/X 风格设计
  - [x] 主页布局优化（删除板块导航和右侧边栏）
  - [x] 响应式设计

### 已完成 ✅

- [x] 内容发布功能
  - [x] Markdown 编辑器集成（TiptapEditor）
  - [x] 图片上传（Cloudflare R2）
  - [x] 封面图上传和裁剪
  - [x] 内容表单验证
  - [x] 发布 API
  - [x] 标签系统
  - [x] 表情选择器
  - [x] 公开/会员内容切换

- [x] 智能审核系统
  - [x] 集成腾讯云天御内容安全 API
  - [x] 语义分析检测（非简单关键词匹配）
  - [x] 多维度检测（色情、政治、违法、广告、谩骂、暴恐）
  - [x] 检测到违规内容时拒绝发布并提示
  - [x] 通过检测后自动发布（approved）
  - [x] 免费额度：每月 10000 条
  - [x] 配置文档和使用指南

### 待办 📋

*Day 2 核心功能已完成*

---

## Day 3: 订阅功能

### 已完成 ✅

- [x] 订阅功能（手动版）
  - [x] 会员标记功能（管理员手动设置）
  - [x] 会员状态检查
  - [x] 付费墙组件
  - [x] 会员到期时间管理

- [x] 用户管理
  - [x] 用户列表
  - [x] 角色管理（user/creator/admin）
  - [x] 会员管理（设置/取消会员）
  - [x] 用户统计面板

### 待办 📋

*Day 3 核心功能已完成*

---

## Day 4: UI 优化与内容填充

### 待办 📋

- [ ] UI 美化
  - [ ] 首页设计
  - [ ] 板块页面设计
  - [ ] 内容详情页设计
  - [ ] 响应式适配

- [ ] 内容填充
  - [ ] 准备示例内容
  - [ ] 联系种子创作者
  - [ ] 发布首批内容

- [ ] SEO 优化
  - [ ] Meta 标签
  - [ ] Open Graph
  - [ ] Sitemap

---

## Day 5: 上线与推广

### 待办 📋

- [ ] 部署到 Vercel
  - [ ] 配置环境变量
  - [ ] 配置域名
  - [ ] 测试生产环境

- [ ] 测试
  - [ ] 功能测试
  - [ ] 移动端测试
  - [ ] 性能测试

- [ ] 推广准备
  - [ ] 准备推广文案
  - [ ] 准备宣传图片
  - [ ] 联系技术社群

---

## Phase 2: 社交功能（MVP 后 1-2 周）

### 已完成 ✅

- [x] 用户间私聊功能
  - [x] 聊天界面设计
  - [x] 消息数据模型（conversations, conversation_participants, messages）
  - [x] 实时消息（Supabase Realtime）
  - [x] 消息通知（未读消息计数）
  - [x] 聊天列表（会话列表页面）
  - [x] 消息历史（消息显示和滚动）
  - [x] 发消息按钮（用户主页）
  - [x] 自动标记已读
  - [x] RLS 安全策略

### 待办 📋

- [ ] 社区/群组功能
  - [ ] 社区数据模型
  - [ ] 创建社区界面
  - [ ] 社区列表页
  - [ ] 社区详情页
  - [ ] 成员管理
  - [ ] 权限系统（管理员/成员）

- [ ] 社区讨论功能
  - [ ] 社区内发帖
  - [ ] 话题/帖子列表
  - [ ] 帖子详情页
  - [ ] 评论和回复
  - [ ] 置顶和精华

---

## Phase 3: 协作功能（2-3 个月后，可选）

### 待办 📋

- [ ] 视频会议（集成第三方）
  - [ ] 集成 Zoom/Google Meet
  - [ ] 会议链接分享
  - [ ] 会议日历

- [ ] 屏幕投屏（或替代方案）
  - [ ] 截图分享
  - [ ] 录屏分享
  - [ ] 或集成第三方屏幕共享服务

---

## 技术债务 ⚠️

*记录需要后续优化的内容*

- 无

---

## 阻塞问题 🚫

*记录当前阻塞进度的问题*

- 无

---

## 决策记录 📝

### 2026-02-14
- 决定使用 Supabase Auth 而不是 NextAuth.js
- 决定使用 Tailwind CSS 3.x 而不是 4.x
- 决定 MVP 阶段不使用 AI 助手
- 决定使用 Cloudflare R2 存储图片

---

**下次更新**: 完成 Day 1 任务后

---

## 产品优化阶段（2026-03-08 开始）

**基于**: 产品评价报告（`docs/product-evaluation-report.md`）
**路线图**: `docs/product-optimization-roadmap.md`
**当前评分**: 7.5/10

---

## Phase 1: 基础加固（1-2 月）🔴 高优先级

### 1.1 可访问性改进

**目标**: 提升 WCAG 2.1 AA 合规性，扩大用户群体

- [ ] 为所有交互元素添加 ARIA 标签
  - [ ] 按钮和链接
  - [ ] 表单输入
  - [ ] 模态框和对话框
  - [ ] 导航菜单
- [ ] 实现键盘导航支持
  - [ ] Tab 键导航
  - [ ] Enter/Space 键激活
  - [ ] Esc 键关闭模态框
  - [ ] 方向键导航列表
- [ ] 添加跳转链接（Skip Links）
- [ ] 添加焦点指示器（Focus Indicators）
- [ ] 使用 NVDA/JAWS 屏幕阅读器测试
- [ ] 使用 axe DevTools 进行自动化扫描
- [ ] 确保颜色对比度符合标准

**验证标准**:
- [ ] axe DevTools 扫描无严重错误
- [ ] 键盘可完成所有核心操作
- [ ] 屏幕阅读器可正确朗读内容

**涉及文件**:
- `components/` - 所有交互组件
- `app/` - 所有页面组件

---

### 1.2 移动端搜索

**目标**: 提升移动端内容发现率 30%+

- [ ] 在移动端 header 添加搜索图标
- [ ] 实现移动优化的搜索 UI（全屏模态）
- [ ] 添加搜索历史功能
- [ ] 添加搜索建议（热门搜索）
- [ ] 考虑语音搜索功能
- [ ] 添加高级筛选（按标签、作者、日期）

**验证标准**:
- [ ] 移动端可轻松访问搜索
- [ ] 搜索响应时间 < 500ms
- [ ] 搜索结果相关性高

**涉及文件**:
- `components/layout/mobile-nav.tsx`
- `app/(main)/search/page.tsx`
- 新建 `components/search/mobile-search-modal.tsx`

---

### 1.3 错误边界和重试机制

**目标**: 提升用户体验，减少流失率

- [ ] 添加全局错误页面
  - [ ] 创建 `app/error.tsx`
  - [ ] 创建 `app/global-error.tsx`
- [ ] 增强错误边界组件
  - [ ] 更新 `components/error-boundary.tsx`
- [ ] 实现自动重试机制（网络请求）
- [ ] 添加离线状态检测
- [ ] 友好的错误提示（避免技术术语）
- [ ] 错误日志收集（考虑 Sentry）
- [ ] 统一错误处理模式

**验证标准**:
- [ ] 所有错误都有友好提示
- [ ] 网络错误自动重试 3 次
- [ ] 错误率 < 1%

**涉及文件**:
- `app/error.tsx` (新建)
- `app/global-error.tsx` (新建)
- `components/error-boundary.tsx` (增强)
- 所有 Server Actions (`lib/actions/`)

---

### 1.4 性能监控

**目标**: 提升加载速度 40%+，改善 SEO

- [ ] 添加 Core Web Vitals 追踪
  - [ ] 在 `app/layout.tsx` 添加 Web Vitals
  - [ ] 创建 `lib/analytics/performance.ts`
- [ ] 实现图片懒加载
- [ ] 优化 bundle 大小（代码分割）
  - [ ] 更新 `next.config.js`
- [ ] 添加性能预算
- [ ] 实现 Service Worker（PWA）
- [ ] 优化首屏加载时间
- [ ] 添加性能监控仪表板

**验证标准**:
- [ ] Lighthouse 分数 > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

**涉及文件**:
- `app/layout.tsx`
- `next.config.js`
- 所有图片组件
- 新建 `lib/analytics/performance.ts`

---

### 1.5 测试覆盖（基础）

**目标**: 提升代码质量，减少 bug

- [ ] 设置 Vitest 测试框架
  - [ ] 安装依赖
  - [ ] 创建 `vitest.config.ts`
  - [ ] 更新 `package.json` 脚本
- [ ] 为核心功能添加单元测试
  - [ ] 认证流程测试
  - [ ] 内容发布测试
  - [ ] 评论系统测试
  - [ ] 点赞/转发测试
- [ ] 设置 Playwright E2E 测试
  - [ ] 安装 Playwright
  - [ ] 创建 `playwright.config.ts`
- [ ] 添加关键用户流程测试
  - [ ] 注册/登录流程
  - [ ] 发布内容流程
  - [ ] 社交互动流程
- [ ] 设置 CI/CD 自动测试

**验证标准**:
- [ ] 单元测试覆盖率 > 50%
- [ ] E2E 测试覆盖核心流程
- [ ] CI 自动运行测试

**涉及文件**:
- 新建 `__tests__/` 目录
- 新建 `e2e/` 目录
- 更新 `package.json`
- 新建 `vitest.config.ts`
- 新建 `playwright.config.ts`

---

## Phase 2: 商业化（2-3 月）🔴 高优先级

### 2.1 会员系统自动化

**目标**: 实现收入增长，减少管理成本

- [ ] 集成支付网关
  - [ ] Stripe（国际）
    - [ ] 创建 Stripe 账户
    - [ ] 配置产品和价格
    - [ ] 实现 Checkout Session
  - [ ] 支付宝（国内）
  - [ ] 微信支付（国内）
- [ ] 实现自动订阅管理
  - [ ] 创建 `lib/actions/payments.ts`
  - [ ] 订阅创建
  - [ ] 订阅更新
  - [ ] 订阅取消
- [ ] 添加 Webhook 处理
  - [ ] 创建 `app/api/webhooks/stripe/route.ts`
  - [ ] 处理支付成功事件
  - [ ] 处理订阅更新事件
  - [ ] 处理订阅取消事件
- [ ] 添加发票生成功能
- [ ] 自动续费提醒
- [ ] 会员权益详细说明页面
- [ ] 订阅管理页面（用户端）
  - [ ] 创建 `app/(main)/(dashboard)/billing/page.tsx`
- [ ] 退款处理流程

**验证标准**:
- [ ] 支付成功率 > 95%
- [ ] 自动续费成功率 > 90%
- [ ] 退款处理时间 < 24h

**涉及文件**:
- 新建 `lib/actions/payments.ts`
- 新建 `app/api/webhooks/stripe/route.ts`
- 新建 `app/api/webhooks/alipay/route.ts`
- 更新 `app/(main)/pricing/page.tsx`
- 新建 `app/(main)/(dashboard)/billing/page.tsx`

---

### 2.2 结构化数据嵌入（SEO）

**目标**: 提升 SEO 排名，增加自然流量 20%+

- [ ] 在内容详情页嵌入 Article schema
  - [ ] 更新 `app/(main)/post/[id]/page.tsx`
- [ ] 在用户主页嵌入 Person/ProfilePage schema
  - [ ] 更新 `app/(main)/u/[username]/page.tsx`
- [ ] 在活动页面嵌入 Event schema
  - [ ] 更新 `app/(main)/events/[id]/page.tsx`
- [ ] 在社区页面嵌入 Organization schema
  - [ ] 更新 `app/(main)/communities/[slug]/page.tsx`
- [ ] 添加面包屑导航 schema
- [ ] 使用 Google Rich Results 测试验证
- [ ] 监控 Google Search Console

**验证标准**:
- [ ] Google Rich Results 测试通过
- [ ] 搜索结果显示富文本片段
- [ ] 自然流量增长 > 20%

**涉及文件**:
- `app/(main)/post/[id]/page.tsx`
- `app/(main)/u/[username]/page.tsx`
- `app/(main)/events/[id]/page.tsx`
- `app/(main)/communities/[slug]/page.tsx`
- 使用 `lib/seo/structured-data.ts`

---

### 2.3 分析隐私合规

**目标**: GDPR 合规，避免法律风险

- [ ] 添加 Cookie 同意横幅
  - [ ] 创建 `components/privacy/cookie-consent.tsx`
- [ ] 实现 GDPR 合规
  - [ ] 用户数据导出功能
  - [ ] 用户数据删除功能
  - [ ] 隐私政策页面
  - [ ] Cookie 政策页面
- [ ] 添加隐私设置页面
  - [ ] 创建 `app/(main)/(dashboard)/settings/privacy/page.tsx`
- [ ] 实现分析追踪的用户控制
- [ ] 添加数据处理协议

**验证标准**:
- [ ] GDPR 合规检查通过
- [ ] 用户可导出/删除数据
- [ ] Cookie 同意率 > 70%

**涉及文件**:
- 新建 `components/privacy/cookie-consent.tsx`
- 新建 `app/(main)/privacy/page.tsx`
- 新建 `app/(main)/cookies/page.tsx`
- 新建 `app/(main)/(dashboard)/settings/privacy/page.tsx`
- 更新 `lib/analytics/events.ts`

---

### 2.4 用户反馈系统

**目标**: 减少支持成本 30%，提升满意度

- [ ] 添加工具提示（Tooltips）
  - [ ] 创建 `components/help/tooltip.tsx`
- [ ] 实现应用内帮助系统
- [ ] 添加用户反馈小部件
  - [ ] 创建 `components/feedback/widget.tsx`
- [ ] 创建帮助文档中心
  - [ ] 创建 `app/(main)/help/page.tsx`
- [ ] 添加 FAQ 页面
  - [ ] 创建 `app/(main)/faq/page.tsx`
- [ ] 实现反馈收集和分类
  - [ ] 创建 `lib/actions/feedback.ts`
- [ ] 添加功能请求投票系统

**验证标准**:
- [ ] 支持请求减少 30%
- [ ] 用户满意度 > 80%
- [ ] 反馈响应时间 < 48h

**涉及文件**:
- 新建 `components/help/tooltip.tsx`
- 新建 `components/feedback/widget.tsx`
- 新建 `app/(main)/help/page.tsx`
- 新建 `app/(main)/faq/page.tsx`
- 新建 `lib/actions/feedback.ts`

---

## Phase 3: 功能深化（3-6 月）🟡 中优先级

### 3.1 社区增强 ✅ 已完成

**目标**: 提升社区活跃度 40%+

#### Phase 3 核心功能（已完成）
- [x] 社区推荐算法
  - [x] 创建推荐算法文件 `lib/algorithms/community-recommendations.ts`
  - [x] 实现基于兴趣标签的推荐逻辑
  - [x] 实现热门社区排行算法
  - [x] 创建 API 端点 `/api/communities/recommendations`
- [x] 社区活动功能
  - [x] 创建活动日历视图组件 `components/community/activity-calendar.tsx`
  - [x] 实现活动提醒通知系统（集成现有通知系统）
  - [x] 创建活动签到功能和 API
  - [x] 创建数据库迁移文件
- [x] 社区管理工具
  - [x] 创建成员管理页面 `/communities/[id]/members`
  - [x] 实现踢出/禁言功能
  - [x] 创建内容审核队列组件
  - [x] 创建社区统计数据仪表板
- [x] 文档和报告
  - [x] 创建功能文档 `docs/community-enhancement-report.md`

#### 未来增强功能
- [ ] 社区角色细分（owner/admin/moderator/member）
- [ ] 社区规则/公告功能
- [ ] 社区徽章系统
- [ ] 社区排行榜

**已创建文件**:
- `lib/algorithms/community-recommendations.ts`
- `app/api/communities/recommendations/route.ts`
- `components/community/activity-calendar.tsx`
- `components/community/member-management-table.tsx`
- `components/community/community-stats-card.tsx`
- `components/community/content-moderation-queue.tsx`
- `lib/actions/community-moderation.ts`
- `app/(main)/communities/[id]/members/page.tsx`
- `supabase/migrations/030_community_enhancements.sql`
- `docs/community-enhancement-report.md`

**已更新文件**:
- `lib/actions/notifications.ts`
- `lib/actions/events.ts`

---

### 3.2 内容增强 ✅ 已完成

**目标**: 提升内容创作体验

#### 富文本编辑器升级
- [x] TipTap 编辑器已集成
- [x] 图片上传功能
- [x] 视频上传功能
- [x] 代码高亮（lowlight 已安装）
- [x] 拖拽上传图片
- [x] 粘贴图片支持
- [x] YouTube/Bilibili 视频嵌入
- [x] Link 扩展

#### 内容协作功能
- [x] 草稿自动保存（localStorage + 数据库）
- [x] 内容版本历史表
- [x] 版本历史记录（自动触发器）
- [x] 版本预览组件
- [x] 版本对比功能
- [x] 版本恢复功能

#### 内容推荐系统
- [x] 推荐算法文件
- [x] 阅读历史追踪
- [x] 相关内容推荐
- [x] 个性化 Feed API
- [x] 热门内容推荐

#### 测试和文档
- [x] 单元测试（drafts, recommendations）
- [x] 功能文档

**已创建文件**:
- `components/editor/embed-extension.ts`
- `lib/actions/drafts.ts`
- `lib/actions/content-versions.ts`
- `lib/algorithms/content-recommendations.ts`
- `app/api/recommendations/route.ts`
- `components/content/version-history.tsx`
- `hooks/use-auto-save.ts`
- `supabase/migrations/030_create_content_enhancement.sql`
- `__tests__/lib/actions/drafts.test.ts`
- `__tests__/lib/algorithms/recommendations.test.ts`
- `docs/content-enhancement-report.md`

**已更新文件**:
- `components/editor/tiptap-editor.tsx`

---

### 3.3 高级功能

**目标**: 提升高级用户体验

- [ ] 键盘快捷键
- [ ] 深色模式切换 UI（系统已存在）
- [ ] 可定制主题
- [ ] 内容书签功能
- [ ] 阅读列表
- [ ] 内容推荐算法优化
- [ ] 个性化首页

**涉及文件**:
- 新建 `components/settings/theme-toggle.tsx`
- 新建 `lib/actions/bookmarks.ts`
- 新建 `lib/actions/reading-list.ts`

---

### 3.4 国际化

**目标**: 扩大全球用户群

- [ ] 添加 i18n 框架（next-intl）
- [ ] 支持英文翻译
- [ ] 基于语言环境的路由
- [ ] 多语言内容支持
- [ ] 翻译管理系统
- [ ] 语言切换 UI

**涉及文件**:
- 新建 `i18n/` 目录
- 更新所有页面和组件
- 更新 `next.config.js`

---

## Phase 4: 规模化（6-12 月）🟢 低优先级

### 4.1 缓存策略优化

- [ ] 实现 Redis 缓存
- [ ] 边缘缓存（Vercel Edge）
- [ ] 使用 React Query/SWR
- [ ] 优化数据库查询
- [ ] 实现 CDN 集成

---

### 4.2 数据库优化

- [ ] 整合数据库迁移文件
- [ ] 添加数据库监控
- [ ] 优化慢查询
- [ ] 实现读写分离
- [ ] 添加数据库备份策略

---

### 4.3 可观测性

- [ ] 集成 Sentry 错误追踪
- [ ] 添加日志聚合（Datadog/LogRocket）
- [ ] 实现 APM 监控
- [ ] 添加告警系统
- [ ] 创建运维仪表板

---

## 成功指标

### Phase 1 成功标准
- [ ] Lighthouse 分数 > 90
- [ ] 移动端搜索使用率 > 30%
- [ ] 错误率 < 1%
- [ ] 测试覆盖率 > 50%

### Phase 2 成功标准
- [ ] 会员自动转化率 > 5%
- [ ] 自然流量增长 > 20%
- [ ] GDPR 合规检查通过
- [ ] 支持请求减少 30%

### Phase 3 成功标准
- [ ] 社区活跃度增长 > 40%
- [ ] 内容创作效率提升 > 30%
- [ ] 用户留存率提升 > 20%

### Phase 4 成功标准
- [ ] 支持 10 万+ 用户
- [ ] P95 响应时间 < 500ms
- [ ] 系统可用性 > 99.9%

---

## 参考文档

- **产品评价报告**: `docs/product-evaluation-report.md`
- **优化路线图**: `docs/product-optimization-roadmap.md`

---

**最后更新**: 2026-03-08
