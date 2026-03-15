# 上线前链路审计（2026-03-15）

本次审计聚焦你刚刚要求的两部分：

1. 登录方式与登录流程
2. 发帖、首页内容流、社区内容流的数据与交互一致性

## 一、结论

核心发布链路目前可用：

- 邮箱登录可用
- GitHub OAuth 登录可用
- 邮箱注册可用
- 普通内容发布可用
- 社区成员发帖可用
- 首页内容流已能混合展示公开社区帖子
- 社区创建者 / 管理员 / 版主的成员管理链路可用

本轮已经顺手修复 5 个会影响上线观感或数据一致性的点。

## 二、本轮已修复

### 1. 首页“关注”tab 对未登录用户的误导

问题：

- 未登录用户也能点击“关注”
- 实际展示的却不是“关注内容”，而是通用内容流

修复：

- 未登录时首页只展示“热门 / 最新”
- 登录后才展示“关注”
- URL 手工传入 `?tab=following` 时，也会回退到真实可用的 tab

影响文件：

- `app/(main)/page.tsx`
- `components/content/feed-tabs.tsx`

### 2. 社区页“最新 / 热门”tab 只有样式，没有真实切换

问题：

- 社区详情页 tab 之前只是静态按钮
- 实际查询永远固定走 `latest`

修复：

- 社区页现在支持 `?tab=latest|popular`
- 点击 tab 会真实切换查询排序

影响文件：

- `app/(main)/communities/[slug]/page.tsx`
- `components/community/community-feed-tabs.tsx`

### 3. 普通发帖页封面上传没有接通

问题：

- “点击上传封面图片”只有视觉区域
- 没有真正绑定文件选择和上传逻辑

修复：

- 已补充隐藏文件输入
- 已接入上传动作
- 上传完成后会写入 `cover_image`

影响文件：

- `components/content/create-post-form.tsx`

### 4. 分类后台已可配置，但前台多个页面仍显示 slug / 旧颜色

问题：

- 分类已改为 `content_categories` 数据驱动
- 但首页流、探索页、趋势页、帖子详情页等仍会回退到旧的本地分类映射
- 新增分类时，颜色和显示名称可能不一致

修复：

- 内容流、探索、趋势、帖子详情改为优先显示数据库分类名称和颜色
- 发帖页、分类页改为直接使用数据库里的分类颜色

影响文件：

- `lib/queries/content.ts`
- `lib/queries/explore.ts`
- `lib/actions/recommendations.ts`
- `lib/types/content.ts`
- `components/content/compact-content-card.tsx`
- `components/content/trending-content-card.tsx`
- `components/content/content-detail-card.tsx`
- `components/content/create-post-form.tsx`
- `components/content/explore-client.tsx`
- `app/(main)/category/[slug]/page.tsx`

### 5. 注册页仍有硬编码营销数字

问题：

- 注册页写死了“加入 52,800+ 开发者社区”
- 这不属于数据库真实数据

修复：

- 已改为不带伪造数字的通用文案

影响文件：

- `app/(auth)/register/page.tsx`

## 三、登录流程审计

### 当前可用方式

- 邮箱登录
- 邮箱注册
- GitHub OAuth 登录
- 忘记密码邮件重置

### 实现状态

- 登录页：`/login`
  - 邮箱登录
  - GitHub OAuth 登录
- 注册页：`/register`
  - 邮箱注册
  - GitHub OAuth 注册
- OAuth 回调：`/auth/callback`
  - 首次 GitHub 登录会补建 `users` 资料
  - 已存在用户只更新头像、邮箱、GitHub URL，不覆盖自定义角色和用户名

### 当前判断

- 作为明天上线版本，邮箱 + GitHub 这两种方式已经满足基本可用性
- OAuth Provider 的真正启停依赖 Supabase Auth 配置，不建议现在再额外造一层业务后台

## 四、内容与社区流审计

### 首页内容流

- 数据源：
  - `contents`
  - `reposts`
  - `community_posts`
  - `follows`
- 当前规则：
  - 首页会聚合普通内容、转发、公开社区帖子
  - 社区帖子会带“社区 · xxx”标签
  - 私密社区帖子不会进首页内容流

### 社区发帖进入首页内容区

当前结论：可以。

- 公开社区中的 `community_posts` 会被并入首页 / 全部内容流
- 进入内容流后，卡片上会显示对应社区标签
- 私密社区帖子不会出现在首页内容流

### 社区发帖权限

- 只有社区成员可以在该社区发帖
- 社区发帖页会先检查成员资格
- 创建后的帖子会回刷：
  - 社区详情页
  - 首页
  - `/contents`

## 五、仍建议继续跟进的风险

### P1

#### 1. `views` 与 `view_count` 双字段仍未完全统一

- 推荐算法和 Agent API 仍有部分逻辑读取 `views`
- 页面主展示口径基本已经是 `view_count`
- 这会带来“排序逻辑”和“页面展示值”口径不完全一致的问题

#### 2. 分类页 / 标签页旧 tab 组件仍有历史遗留

- `/category/[slug]`
- `/tag/[name]`

这些页面仍挂着旧版 tab 组件，但真实排序逻辑并不完整，属于历史 UI 残留，建议后续单独收口。

#### 3. 社区审核队列组件未真正接通

- `components/community/content-moderation-queue.tsx`

当前“通过 / 拒绝”还是 TODO，只能算 UI 壳子，不应当视为已上线后台能力。

## 六、本轮验证结果

- `npm run lint` 通过
- `npm run test:run` 通过
- `npm run build` 通过

说明：

- Vitest 里 `theme-storage` 相关测试仍会打印一次故意触发的 JSON parse 错误日志，但测试本身通过，不是功能故障
