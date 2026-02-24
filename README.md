# AI-Dating

> 开放的 AI 开发者学习社区 - 分享技术见解，连接开发者

## 📖 项目简介

AI-Dating 是一个专注于 AI 开发者的内容分享和学习社区平台。用户可以发布技术文章、分享经验、互动交流。

**核心特点：**
- 🔒 会员内容付费墙（token支持）
- 💬 实时聊天系统

## 🚀 技术栈

### 前端
- **框架**: Next.js 16.1.6 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3.x
- **组件**: shadcn/ui
- **编辑器**: Tiptap (Markdown)

### 后端
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth (GitHub OAuth)
- **存储**: Cloudflare R2
- **实时**: Supabase Realtime

### 第三方服务
- **内容审核**: 腾讯云天御（每月 10000 条免费）
- **图片存储**: Cloudflare R2（10GB 免费）

## ✨ 已实现功能

### Day 1 - 基础搭建 ✅
- [x] 项目初始化（Next.js + TypeScript + Tailwind）
- [x] Supabase 配置和数据库 Schema
- [x] GitHub OAuth 登录
- [x] shadcn/ui 组件库集成

### Day 2 - 核心功能 ✅
- [x] 用户个人主页（统计、内容标签页）
- [x] 内容列表页（Twitter 风格）
- [x] 内容详情页（Markdown 渲染）
- [x] 内容发布功能
  - [x] Tiptap 编辑器
  - [x] 图片上传（Cloudflare R2）
  - [x] 封面图上传和裁剪
  - [x] 标签系统
  - [x] 表情选择器
- [x] 智能内容审核（腾讯云天御）
- [x] UI/UX 优化（Twitter 风格）

### Day 3 - 订阅功能 ✅
- [x] 会员系统（手动管理）
- [x] 付费墙组件
- [x] 用户管理后台
- [x] 角色管理（user/creator/admin）

### Phase 2 - 社交功能 ✅
- [x] 用户间私聊（Supabase Realtime）
  - [x] 实时消息推送
  - [x] 未读消息计数
  - [x] 会话列表
  - [x] 消息历史
  - [x] 自动标记已读
- [x] 实时通知系统
- [x] 点赞、转发、评论
- [x] 关注系统
- [ ] 社区/群组功能（待开发）

## 📂 项目结构

```
AI-Dating/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面
│   ├── (main)/              # 主要页面
│   │   ├── (dashboard)/     # 用户仪表板
│   │   ├── messages/        # 聊天页面
│   │   ├── post/            # 内容详情
│   │   └── u/               # 用户主页
│   └── api/                 # API 路由
├── components/              # React 组件
│   ├── admin/              # 管理员组件
│   ├── chat/               # 聊天组件
│   ├── content/            # 内容组件
│   ├── editor/             # 编辑器组件
│   ├── layout/             # 布局组件
│   └── ui/                 # UI 组件（shadcn/ui）
├── lib/                     # 工具函数和配置
│   ├── actions/            # Server Actions
│   ├── queries/            # 数据查询
│   ├── supabase/           # Supabase 客户端
│   ├── tencent/            # 腾讯云集成
│   └── utils/              # 工具函数
├── docs/                    # 项目文档
├── supabase/               # 数据库迁移
└── tasks/                   # 任务和计划

```

## 🎯 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd AI-Dating
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2
R2_ENDPOINT=your_r2_endpoint
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=your_public_url

# 腾讯云天御（可选）
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

### 4. 运行数据库迁移

在 Supabase 控制台执行 `supabase/migrations/` 中的 SQL 文件。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📚 文档索引

### 快速开始
- [Supabase 配置指南](docs/supabase-setup-guide.md)
- [Cloudflare R2 配置](docs/R2_SETUP.md)
- [腾讯云天御配置](docs/tencent-cloud-moderation-setup.md)

### 功能文档
- [MVP 功能规格](docs/mvp-features.md)
- [5 天发布计划](docs/5-day-launch-plan.md)
- [Day 2 功能总结](docs/day2-summary.md)

### 商业文档
- [商业模式画布](docs/business-model-canvas.md)
- [财务分析](docs/financial-analysis.md)
- [用户增长策略](docs/user-growth-strategy.md)
- [冷启动运营](docs/cold-start-operations.md)

### 开发文档
- [项目状态](docs/project-status.md)
- [内容审核政策](docs/content-moderation-policy.md)
- [风险应对计划](docs/risk-contingency-plan.md)

### 任务管理
- [任务清单](tasks/todo.md)
- [Day 2 测试指南](docs/day2-testing-guide.md)

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式组件
- 优先使用 Server Components
- 使用 Tailwind CSS 进行样式设计

### Git 工作流
- 功能分支开发
- 有意义的 commit messages
- 提交前自我审查

### 项目约束
- **5 天上线目标**
- **0 预算**（使用免费服务）
- **单人开发**

## 🎨 设计风格

项目采用 Twitter/X 风格的设计：
- 扁平化设计，无卡片边框
- 使用分隔线（border-b）
- 悬停效果（hover:bg-muted/40）
- 居中布局，最大宽度 600px
- 清晰的视觉层次

## 🚀 部署

### Vercel 部署（推荐）

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 环境变量配置

确保在 Vercel 中配置所有必要的环境变量（参考 `.env.local.example`）。

## 📊 项目进度

- ✅ Day 1: 基础搭建
- ✅ Day 2: 核心功能
- 🚧 Day 3: 订阅功能（计划中）
- 📅 Day 4: UI 优化（计划中）
- 📅 Day 5: 上线（计划中）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- 项目地址：[GitHub Repository]
- 问题反馈：[GitHub Issues]

---

**最后更新**: 2026-02-16
**当前版本**: MVP v1.0
**开发状态**: Day 2 完成 ✅
