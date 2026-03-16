# 后台管理审计清单（2026-03-15）

本文梳理当前项目里已经具备后台管理能力的对象，以及数据库/业务上已经存在、但暂时还没有全局后台入口的对象，方便后续决定后台范围。

更新日期：2026-03-16

本次已新增后台模块：
- `/admin/tags`
- `/admin/communities`
- `/admin/events`
- `/admin/privacy-requests`
- `/admin/community-rules`

同时完成了两个关键业务修正：
- 社区详情页右侧“社区规则”已改为数据库驱动，不再使用页面内硬编码数组
- 用户数据导出 / 注销已改成“用户提交请求 -> 后台处理”的真实流程，不再前台即时完成

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

### 7. 标签管理
- 路由：`/admin/tags`
- 数据来源：`tags`、`content_tags`、`contents.tags`
- 当前能力：
  - 查看全部标签及使用次数
  - 新建标签
  - 编辑标签名称、slug、描述
  - 合并重复标签
  - 删除未被使用的标签
  - 标签改名/合并时同步修正遗留的 `contents.tags` 数据

### 8. 平台级社区管理
- 路由：`/admin/communities`
- 数据来源：`communities`、`community_members`
- 当前能力：
  - 查看全站社区列表
  - 后台创建社区
  - 编辑社区名称、slug、描述、图标、封面、公开/私密状态
  - 平台级删除社区

### 9. 活动管理
- 路由：`/admin/events`
- 数据来源：`events`、`event_participants`
- 当前能力：
  - 查看全站活动列表
  - 后台创建活动
  - 编辑活动标题、地点、时间、封面、类型、状态
  - 删除活动

### 10. 数据导出 / 注销请求管理
- 路由：`/admin/privacy-requests`
- 数据来源：`data_export_requests`、`account_deletion_requests`
- 当前能力：
  - 查看全部导出请求和注销请求
  - 推进请求状态（`pending` / `processing` / `completed` / `failed` / `cancelled`）
  - 导出请求完成后自动生成用户可访问的下载入口
  - 注销请求完成时才执行真实匿名化

### 11. 社区规则管理
- 路由：`/admin/community-rules`
- 数据来源：`community_rules`
- 当前能力：
  - 按社区新增规则
  - 编辑规则内容、排序、启用状态
  - 删除规则
  - 前台社区详情页实时读取规则数据

## 二、已有“局部管理”，但不是全局后台

### 1. 社区设置
- 路由：`/communities/[slug]/settings`
- 数据来源：`communities`
- 管理者：社区创建者、社区管理员
- 当前能力：
  - 修改社区名称、描述、类型、图标、封面
  - 删除社区
  - 创建者默认身份为`版主`，但保留社区最高控制权

### 2. 社区成员与社区内审核
- 数据来源：`community_members`、`community_member_bans`、`community_posts`
- 当前能力：
  - 创建者 / 管理员 / 版主访问成员管理页
  - 创建者可管理全部成员角色
  - 版主可将普通成员提升为管理员或版主
  - 非创建者版主不能修改已有管理员
  - 社区创建者不可被移除、踢出、禁言或降权
  - 社区帖子创建、置顶、编辑、删除
- 当前缺口：
  - 平台级社区总后台仍缺失
  - `components/community/content-moderation-queue.tsx` 里的“通过/拒绝”逻辑仍是 TODO，不能算已完成后台能力

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

### P1：已经落地的全局后台

#### 1. 标签管理
- 状态：已完成
- 路由：`/admin/tags`

#### 2. 社区全局管理
- 状态：已完成
- 路由：`/admin/communities`

#### 3. 活动管理
- 状态：已完成
- 路由：`/admin/events`

#### 4. 数据导出/注销请求管理
- 状态：已完成
- 路由：`/admin/privacy-requests`

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

#### 8. 社区规则配置
- 当前状态：
  - 已新增 `community_rules` 表
  - 已新增平台后台 `/admin/community-rules`
  - 社区详情页已读取数据库规则
- 后续可选增强：
  - 社区内 settings 页增加规则管理入口
  - 平台默认规则模板
  - 批量复制规则到多个社区

#### 9. OAuth 登录开关与文案
- 当前状态：
  - 前台已支持邮箱登录、邮箱注册、GitHub OAuth 登录
  - Provider 的真正启停仍由 Supabase Auth 配置控制
- 建议：
  - 不优先做成业务后台
  - 先在 Supabase Auth / 环境变量层管理
  - 如果未来要开放多 Provider（GitHub / Google / 飞书等），再做“登录方式配置后台”

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
2. 标签管理（已完成）
3. 社区全局管理（已完成）
4. 活动管理（已完成）
5. 数据导出/注销请求管理（已完成）

### 第二批可选
1. 平台通知/公告管理
2. 首页推荐位管理
3. Onboarding 配置管理
4. 社区规则管理增强（社区内入口 / 模板 / 批量配置）
5. 多 OAuth Provider 配置后台
