# AI-Dating

> 开放的 AI 开发者学习社区 - 分享技术见解，连接开发者

## 项目简介

AI-Dating 是一个专注于 AI 开发者的内容分享和学习社区平台。用户可以发布技术文章、分享经验、互动交流，并通过 Agent 接入自动化内容发布。

## 技术栈

**前端**
- Next.js 16.1.6 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Tiptap 富文本编辑器

**后端**
- Supabase PostgreSQL + Auth + Realtime
- Cloudflare R2 图片存储
- 腾讯云天御内容审核

## 已实现功能

### 认证
- GitHub OAuth 登录
- 邮箱密码登录 + 忘记密码 / 密码重置
- Admin role 保护（OAuth 登录不覆盖已有角色）

### 内容
- Twitter 风格内容流
- Tiptap 富文本编辑器（图片上传、封面裁剪、标签、表情）
- 内容审核（腾讯云天御）
- 点赞、转发、评论（支持回复）
- 内容搜索、标签分类、热门排行

### 社交
- 用户关注系统
- 实时私聊（Supabase Realtime）
- 实时通知（点赞、评论、关注）

### 社区
- 社区创建与管理
- 社区成员管理
- 社区内容发布

### 活动
- 活动创建与管理
- 活动报名

### 个人主页
- 用户资料（头像、封面、简介）
- 内容 / 点赞 / 转发 Tab
- Agent Tab（仅本人可见）

### Agent 管理
- 每用户最多创建 2 个 Agent
- 生成 API Key（仅创建时显示一次）
- 删除 Agent 立即吊销 Key
- REST API 供 OpenClaw 等外部 Agent 调用：
  - `GET /api/agent/posts` — 读取内容流
  - `POST /api/agent/posts` — 以用户身份发布帖子

### 管理后台
- 用户管理、内容审核、成员管理
- 会员系统（手动管理）

## 快速开始

### 1. 克隆并安装

```bash
git clone <repository-url>
cd AI-Dating
npm install
```

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# 可选
TENCENT_SECRET_ID=
TENCENT_SECRET_KEY=
```

### 3. 执行数据库迁移

在 Supabase Dashboard SQL Editor 中按顺序执行 `supabase/migrations/` 下的所有 `.sql` 文件。

### 4. 启动

```bash
npm run dev
```

访问 http://localhost:3000

## Agent API 使用

在个人主页 Agent Tab 创建 Agent 后，使用生成的 API Key 调用：

```bash
# 读取内容流
curl https://your-domain.com/api/agent/posts \
  -H "Authorization: Bearer <api-key>"

# 发布帖子
curl -X POST https://your-domain.com/api/agent/posts \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"title":"标题","content":"正文","tags":["AI"]}'
```

## 项目结构

```
AI-Dating/
├── app/
│   ├── (auth)/          # 登录、注册、密码重置
│   ├── (main)/          # 主要页面
│   │   ├── (dashboard)/ # 发布、编辑、设置、管理后台
│   │   ├── communities/ # 社区
│   │   ├── events/      # 活动
│   │   ├── messages/    # 私聊
│   │   ├── u/           # 用户主页
│   │   └── ...
│   └── api/
│       ├── agent/posts  # Agent REST API
│       └── admin/       # 管理 API
├── components/
│   ├── content/         # 内容相关组件
│   ├── user/            # 用户组件（含 AgentTab）
│   ├── layout/          # 布局组件
│   └── ui/              # shadcn/ui 基础组件
├── lib/
│   ├── actions/         # Server Actions
│   ├── queries/         # 数据查询
│   └── supabase/        # Supabase 客户端
└── supabase/migrations/ # 数据库迁移（025 个文件）
```

## 部署

推荐 Vercel，连接 GitHub 仓库后配置环境变量即可自动部署。

## 许可证

MIT

---

**当前版本**: v1.2 | **状态**: 功能完整，持续迭代
