# 首页数据审计

日期：2026-03-13

## 结论

首页中间内容流已经连接真实数据库数据，但首页顶部欢迎区、左侧社区目录、右侧社区简报中的大部分统计与列表仍然是硬编码占位数据，当前页面并不能完整反映数据库真实状态。

## 已连接真实数据的区域

### 1. 首页内容流

- 入口文件：[app/(main)/page.tsx](/Users/a77/Desktop/AI-Dating/app/(main)/page.tsx)
- 查询函数：[lib/queries/content.ts](/Users/a77/Desktop/AI-Dating/lib/queries/content.ts)
- 数据来源：
  - `contents`
  - `reposts`
  - `users`
  - `follows`（仅 `following` tab）

#### 当前行为

- `hot`：按 `likes_count * 3 + comments_count * 2 + view_count * 0.1` 排序
- `latest`：按发布时间或转发时间倒序
- `following`：按 `follows` 表中过滤关注用户内容

### 2. 新用户引导进度卡

- 查询函数：[lib/actions/onboarding.ts](/Users/a77/Desktop/AI-Dating/lib/actions/onboarding.ts)
- 数据来源：
  - `user_onboarding`

#### 当前行为

- 已登录用户会读取自己的 onboarding 进度
- 若记录不存在，会自动创建一条新记录

### 3. 列表卡片内的互动数据

- 组件：[components/content/compact-content-card.tsx](/Users/a77/Desktop/AI-Dating/components/content/compact-content-card.tsx)
- 字段来源：
  - `likes_count`
  - `comments_count`
  - `view_count`
  - `tags`
  - `users`

## 当前仍是硬编码或占位数据的区域

### 1. 顶部欢迎区统计

- 组件：[components/home/welcome-banner.tsx](/Users/a77/Desktop/AI-Dating/components/home/welcome-banner.tsx)
- 当前默认值：
  - `developers: 52800`
  - `online: 1247`
  - `communities: 8`

#### 判断

- 这是硬编码假数据
- 当前页面没有从 `users`、在线会话或 `communities` 查询这些值

### 2. 左侧“我的社区”

- 组件：[components/home/categories-sidebar.tsx](/Users/a77/Desktop/AI-Dating/components/home/categories-sidebar.tsx)
- 当前数据：
  - `MY_COMMUNITIES`
  - `TRENDING_COMMUNITIES`

#### 判断

- 这是硬编码假数据
- 虽然项目存在真实查询函数 [lib/queries/communities.ts](/Users/a77/Desktop/AI-Dating/lib/queries/communities.ts)
  - `getUserCommunities()`
  - `getTrendingCommunities()`
- 但首页左栏目前没有接入这些查询

### 3. 右侧“社区简报”

- 组件：[components/home/community-sidebar.tsx](/Users/a77/Desktop/AI-Dating/components/home/community-sidebar.tsx)
- 当前数据：
  - `defaultCommunityInfo`
  - `defaultTrendingTags`
  - `defaultActiveCommunities`

#### 判断

- 这是硬编码假数据
- 项目里已有可连接的真实表：
  - `communities`
  - `tags`
- 但首页右栏目前没有接入：
  - `getTrendingCommunities()`
  - 标签 usage_count 查询

## 页面数据与数据库的一致性检查

### 一致的部分

- 首页 feed 使用的主表与字段在数据库中都存在：
  - `contents.likes_count`
  - `contents.comments_count`
  - `contents.reposts_count`
  - `contents.view_count`
  - `contents.tags`
  - `contents.author_id`
  - `reposts.content_id`
  - `follows.following_id`
  - `user_onboarding.*`

### 不一致或有风险的部分

#### 1. `views` 与 `view_count` 双字段并存

- 数据库类型定义里 `contents` 同时存在：
  - `views`
  - `view_count`
- 首页和大多数组件使用的是 `view_count`
- 但部分算法和 API 仍在使用 `views`
  - 例如：[lib/algorithms/content-recommendations.ts](/Users/a77/Desktop/AI-Dating/lib/algorithms/content-recommendations.ts)
  - 例如：[app/api/agent/posts/route.ts](/Users/a77/Desktop/AI-Dating/app/api/agent/posts/route.ts)

#### 风险

- 同一业务概念存在两个字段，容易导致：
  - 首页展示与推荐算法口径不同
  - API 返回值与页面显示值不一致
  - 某些地方更新了 `view_count`，另一些地方仍读取 `views`

#### 2. 首页社区侧栏没有使用真实社区统计

- 数据库 `communities` 表存在：
  - `members_count`
  - `posts_count`
- 社区详情页已经使用真实社区计数
- 但首页左右侧栏仍显示硬编码数量

#### 风险

- 首页社区热度和社区详情页会出现数值不一致

#### 3. 首页热门标签未连接 `tags.usage_count`

- 数据库已有：
  - `tags`
  - `usage_count`
- 相关查询逻辑也存在：
  - [lib/queries/explore.ts](/Users/a77/Desktop/AI-Dating/lib/queries/explore.ts)
- 但首页右栏仍写死标签和数量

#### 风险

- 首页“热门标签”与搜索/发现页不一致

## 建议改造顺序

### 第一优先级

1. 统一内容浏览数字段，只保留一个标准口径：优先 `view_count`
2. 首页右栏活跃社区改为读取 `getTrendingCommunities()`
3. 首页热门标签改为读取 `tags.usage_count`

### 第二优先级

1. 左侧“我的社区”改为登录后读取 `getUserCommunities()`
2. 未登录时显示推荐社区或空状态

### 第三优先级

1. 顶部统计区改为真实聚合：
  - 开发者数：`users` 总量
  - 社区数：`communities` 总量或公开社区总量
  - 在线数：如果没有在线会话表，先下掉或改成“累计内容数”等可真实聚合指标

## 当前最重要的判断

首页现在不是“全假”，但也远没到“页面数据与数据库完全一致”。

可以这样理解：

- 中间内容流：真实
- 引导进度：真实
- 头部统计：假
- 左栏社区：假
- 右栏社区与标签：假
- 浏览数字段：存在历史字段分裂风险
