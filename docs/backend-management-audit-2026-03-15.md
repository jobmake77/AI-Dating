# 后台管理审计清单（2026-03-15）

本文梳理当前项目里已经具备后台管理能力的对象，以及数据库/业务上已经存在、但暂时还没有全局后台入口的对象，方便后续决定后台范围。

## 一、已经有全局后台的模块

### 1. 用户管理
- 路由：`/admin/users`
- 数据来源：`users`
- 当前能力：
  - 查看用户列表
  - 查看邮箱、头像、角色、注册时间
  - 调整角色（`user` / `creator` / `admin`）

### 2. 内容审核
- 路由：`/admin/moderation`
- 数据来源：`contents`、`moderation_logs`
- 当前能力：
  - 查看待审核内容
  - 批准/拒绝内容
  - 查看审核统计

### 3. 内容管理
- 路由：`/admin/contents`
- 数据来源：`contents`、`content_tags`
- 当前能力：
  - 查看待审核内容
  - 进行审核操作
  - 查看作者与标签

### 4. 内容分类管理
- 路由：`/admin/categories`
- 数据来源：`content_categories`
- 当前能力：
  - 新增分类
  - 编辑分类名称、slug、描述、颜色、排序、启用状态、可见角色
  - 删除未使用分类
  - 停用已被内容使用的分类
  - slug 变更时同步更新 `contents.category`

### 5. 数据看板
- 路由：`/admin/analytics`
- 数据来源：`users`、`contents`、`analytics_events`
- 当前能力：
  - 总用户、DAU/WAU/MAU、内容总数
  - 增长趋势
  - 留存分析
  - 热门内容排行

### 6. 性能监控
- 路由：`/admin/performance`
- 数据来源：`web_vitals`、`performance_metrics`
- 当前能力：
  - 查看近 7 天性能指标
  - 查看 Core Web Vitals

## 二、已有“局部管理”，但不是全局后台

### 1. 社区设置
- 路由：`/communities/[slug]/settings`
- 数据来源：`communities`
- 管理者：社区管理员
- 当前能力：
  - 修改社区名称、描述、类型、图标、封面
  - 删除社区

### 2. 社区成员与社区内审核
- 数据来源：`community_members`、`community_member_bans`、`community_posts`
- 当前能力：
  - 社区管理员/版主管理成员、邀请、封禁
  - 社区内帖子审核与管理

### 3. 用户个人设置
- 路由：`/settings`、`/settings/privacy`
- 数据来源：`users`、`user_preferences`、`user_privacy_settings`、`user_agents`
- 当前能力：
  - 个人资料
  - 外观/语言/辅助功能
  - 通知设置
  - 隐私设置
  - Agent 管理

## 三、已经有业务数据，但没有全局后台管理页

### P1：建议尽快进入全局后台

#### 1. 标签管理
- 表：`tags`、`content_tags`
- 当前状态：
  - 标签会在发帖时自动创建
  - 有热门标签、搜索标签能力
- 建议后台能力：
  - 查看全部标签
  - 合并重复标签
  - 停用违规标签
  - 修正标签名/slug

#### 2. 社区全局管理
- 表：`communities`、`community_members`、`community_posts`
- 当前状态：
  - 只有社区内管理，没有平台级社区后台
- 建议后台能力：
  - 社区列表、搜索、上下线
  - 修改社区状态
  - 平台级封禁/推荐社区
  - 查看社区发帖量、成员数、活跃度

#### 3. 活动管理
- 表：`events`、`event_participants`
- 当前状态：
  - 有创建、报名、签到
  - 没有全局后台
- 建议后台能力：
  - 活动列表、筛选、上下线
  - 官方活动置顶/推荐
  - 报名数据与签到数据查看

#### 4. 数据导出/注销请求管理
- 表：`data_export_requests`、`account_deletion_requests`
- 当前状态：
  - 用户侧可触发
  - 管理员侧没有专门处理页
- 建议后台能力：
  - 查看请求列表
  - 标记处理状态
  - 审计处理记录

### P2：按业务增长再决定

#### 5. 通知管理
- 表：`notifications`
- 当前状态：
  - 系统会创建通知
  - 没有“平台公告/运营消息”的后台入口
- 适合在需要运营消息时补：
  - 批量发站内通知
  - 公告模板
  - 定时通知

#### 6. 推荐/热门配置
- 涉及：首页热门、趋势、推荐逻辑
- 当前状态：
  - 主要由数据和算法驱动
- 如果你希望运营可控，建议补：
  - 首页推荐位
  - 社区推荐位
  - 活动推荐位
  - 人工置顶

#### 7. Onboarding 配置
- 表：`user_onboarding`
- 当前状态：
  - 只记录用户完成状态
  - 没有后台配置“引导步骤”
- 如果未来频繁改新手引导，再补后台更合适

## 四、目前不建议优先做后台的对象

### 1. 收藏 / 草稿 / 阅读历史 / 内容版本
- 表：`bookmarks`、`content_drafts`、`reading_history`、`content_versions`
- 这些更偏用户个人数据，通常不需要运营后台

### 2. 聊天 / 消息
- 表：`conversations`、`messages`
- 除非要做风控审计，否则不建议现在就做复杂后台

### 3. 性能与监控底层表
- 表：`analytics_events`、`api_metrics`、`slow_query_logs`、`archive_logs`
- 这些适合做内部监控，不适合当作运营后台优先项

### 4. 订阅/会员
- 表：`subscriptions`
- 当前产品方向已经明确不做会员商业化
- 建议：
  - 不新增后台
  - 后续可评估是否直接下线相关遗留字段/表

## 五、当前建议的后台优先级

### 第一批建议做
1. 内容分类管理（已完成）
2. 标签管理
3. 社区全局管理
4. 活动管理
5. 数据导出/注销请求管理

### 第二批可选
1. 平台通知/公告管理
2. 首页推荐位管理
3. Onboarding 配置管理
