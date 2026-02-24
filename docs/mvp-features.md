# AI-Dating MVP 功能规格文档

**版本**: MVP v1.0  
**目标**: 5天内上线  
**约束**: 0预算、单人开发、无支付渠道

---

## 一、功能总览

### 核心功能矩阵

| 模块 | 功能 | 优先级 | 5天计划 |
|------|------|--------|---------|
| **用户系统** | GitHub OAuth登录 | P0 | Day 1 |
| | 个人主页 | P0 | Day 2 |
| | 用户角色（读者/创作者）| P1 | Day 2 |
| **内容系统** | Markdown发布 | P0 | Day 2 |
| | 内容列表 | P0 | Day 2 |
| | 内容详情 | P0 | Day 2 |
| | 标签系统 | P0 | Day 2 |
| | 代码高亮 | P1 | Day 4 |
| | 搜索功能 | P1 | Day 4 |
| **订阅系统** | 付费墙展示 | P1 | Day 3 |
| | 手动会员标记 | P2 | Day 3 |
| | 支付接入 | P3 | 延后 |
| **AI助手** | 智能问答 | P1 | Day 3 |
| | RAG检索 | P2 | Day 3 |
| **管理后台** | 内容审核 | P0 | Day 2 |
| | 用户管理 | P1 | Day 3 |
| **其他** | 响应式UI | P0 | Day 4 |
| | SEO优化 | P1 | Day 4 |
| | 性能优化 | P2 | Day 5 |

---

## 二、用户端功能详情

### 2.1 认证系统

#### GitHub OAuth登录
- **入口**: 首页右上角"登录"按钮
- **流程**: 
  ```
  点击登录 → 跳转GitHub授权 → 授权成功 → 创建/更新用户 → 返回首页(已登录)
  ```
- **字段**: id, username, email, avatar, role(user/creator), created_at
- **首次登录**: 自动创建用户，role默认为user

#### 个人主页
- **路径**: /u/[username]
- **展示内容**:
  - 用户头像、昵称
  - 个人简介（可编辑）
  - 发布的内容列表
  - 关注数/粉丝数（MVP可不做）

---

### 2.2 内容浏览

#### 首页
- **路径**: /
- **布局**:
  - 顶部导航：Logo、搜索框、登录/用户头像
  - 主内容区：最新内容列表（Twitter 风格）
  - 右侧边栏：热门标签

#### 内容详情页
- **路径**: /post/[id]
- **展示**:
  - 标题、作者、发布时间
  - 内容标签
  - 内容正文（Markdown渲染）
  - 代码高亮
  - 作者卡片（头像+简介）
  - 相关推荐（3篇）

#### 付费墙逻辑（简化版）
```
用户访问付费内容 → 检查登录状态
├─ 未登录 → 显示"登录后阅读"遮罩
├─ 已登录非会员 → 显示"订阅解锁全站"遮罩
└─ 已登录会员 → 完整展示
```

---

### 2.3 AI助手

#### 位置
- 右下角悬浮按钮
- 点击展开对话窗口

#### 功能
- **技术问答**: 回答编程、AI相关问题
- **内容推荐**: "我想学React" → 推荐相关文章
- **简单对话**: 支持多轮对话

#### 限制
- MVP版本仅支持预设知识库（前10篇内容）
- 每日调用限额（控制成本）

---

## 三、创作者端功能详情

### 3.1 内容发布

#### 发布入口
- 登录后导航栏显示"发布"按钮
- 路径: /create

#### 发布表单
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 内容 | markdown | 是 | 富文本编辑器 |
| 封面图 | image | 否 | 可选封面图 |
| 价格类型 | select | 是 | 免费/会员可见 |
| 标签 | text | 否 | 最多5个标签 |

#### 编辑器功能
- Markdown语法支持
- 代码块（支持语法高亮）
- 图片上传（拖拽/粘贴）
- 实时预览

#### 发布流程
```
填写表单 → 点击发布 → 敏感词检测（API）→ 
├─ 通过 → 状态:approved → 立即上线
└─ 疑似违规 → 状态:pending → 人工审核
```

---

### 3.2 创作者后台

#### 路径
- /creator/dashboard

#### 功能模块
| 模块 | 功能 |
|------|------|
| **内容管理** | 已发布列表、编辑、删除 |
| **数据分析** | 阅读量、点赞数（MVP简化）|
| **收益概览** | 累计收益、待提现金额（后期）|

---

## 四、管理后台功能

### 4.1 内容审核

#### 审核列表
- 路径: /admin/contents
- 状态筛选: all/pending/approved/rejected
- 操作: 通过/拒绝
- 拒绝时填写原因

#### 审核流程
```
创作者发布 → 机器审核 → 
├─ 通过 → 上线
├─ 疑似违规 → 人工审核队列 → 审核员决定
└─ 确认违规 → 拒绝，通知作者
```

### 4.2 用户管理

- 用户列表
- 角色修改（user/creator/admin）
- 禁用/启用账号

### 4.3 会员管理（手动版）

- 用户列表显示会员状态
- 手动标记为会员（MVP无自动支付）
- 会员有效期设置

---

## 五、技术实现方案

### 5.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Next.js 14 + TypeScript | App Router |
| **样式** | Tailwind CSS | 快速开发 |
| **组件** | shadcn/ui | 基础组件库 |
| **后端** | Next.js API Routes | 无需单独后端 |
| **数据库** | Supabase PostgreSQL | 免费额度 |
| **认证** | NextAuth.js | GitHub OAuth |
| **存储** | Supabase Storage | 图片存储 |
| **AI** | LangChain + 国产大模型API | 低成本 |

### 5.2 数据库Schema（最简化）

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar TEXT,
  role TEXT DEFAULT 'user', -- user, creator, admin
  is_member BOOLEAN DEFAULT false,
  member_expire_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 内容表
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL, -- source-code, workshop, architecture, ai-frontier, interview
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  price_type TEXT DEFAULT 'free', -- free, member
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reject_reason TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 审核记录表
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES contents(id),
  moderator_id UUID REFERENCES users(id),
  action TEXT, -- approve, reject
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.3 API路由设计

| 路由 | 方法 | 功能 |
|------|------|------|
| /api/auth/[...nextauth] | ALL | NextAuth配置 |
| /api/posts | GET | 内容列表 |
| /api/posts | POST | 创建内容 |
| /api/posts/[id] | GET | 内容详情 |
| /api/posts/[id] | PUT | 更新内容 |
| /api/posts/[id] | DELETE | 删除内容 |
| /api/tags | GET | 标签列表 |
| /api/tags/[slug] | GET | 标签内容 |
| /api/ai/chat | POST | AI助手对话 |
| /api/admin/contents | GET | 审核列表（管理员）|
| /api/admin/contents/[id] | PUT | 审核操作（管理员）|

---

## 六、页面清单

### 用户端页面
| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | / | 最新内容列表 |
| 标签页 | /tag/[slug] | 标签内容列表 |
| 内容详情 | /post/[id] | 文章详情 |
| 个人主页 | /u/[username] | 用户主页 |
| 发布页 | /create | 创建内容（需登录）|
| 编辑页 | /edit/[id] | 编辑内容（需登录）|

### 管理后台页面
| 页面 | 路径 | 说明 |
|------|------|------|
| 审核列表 | /admin/contents | 内容审核 |
| 用户管理 | /admin/users | 用户列表 |

---

## 七、MVP vs 完整版对比

| 功能 | MVP (5天) | 完整版 |
|------|----------|--------|
| 登录 | GitHub only | +手机号+微信 |
| 支付 | 手动标记 | 自动微信支付 |
| 内容类型 | 文章 | +视频+直播 |
| 编辑器 | Markdown | 富文本编辑器 |
| 评论 | ❌ | ✅ |
| 点赞收藏 | ❌ | ✅ |
| 关注系统 | ❌ | ✅ |
| 创作者收益 | ❌ | ✅ 自动结算 |
| 推荐算法 | ❌ | ✅ 个性化推荐 |
| 通知系统 | ❌ | ✅ 站内+邮件 |
| 数据分析 | 基础 | 完整数据看板 |
| 移动端App | ❌ | ✅ PWA/App |

---

## 八、验收标准

### Day 5 验收清单
- [ ] GitHub登录正常
- [ ] 可以发布Markdown文章
- [ ] 标签系统正常工作
- [ ] 内容列表/详情正常
- [ ] 付费墙逻辑正常（手动标记会员）
- [ ] AI助手可以对话
- [ ] 管理员可以审核内容
- [ ] 移动端可用
- [ ] 部署到Vercel正常访问
- [ ] 已有5篇以上内容

---

## 九、风险提示

| 风险 | 影响 | 应对 |
|------|------|------|
| 5天做不完 | 上线延期 | 砍掉非P0功能 |
| 内容不够 | 用户留存低 | 自己写+转载注明来源 |
| 用户不来 | 冷启动失败 | 私聊所有技术圈朋友 |
| 服务器超限 | 额外费用 | 先用免费额度，超限再处理 |
| 审核压力大 | 内容质量差 | 严格冷启动标准 |

---

*本文档为MVP开发指导，完整功能见后续版本规划*
