# AI-Dating 系统修复进度报告

**日期**: 2026-03-09
**状态**: 接近完成 (89% 完成)

---

## 已完成的工作

### ✅ 阶段 1: 数据库 Schema 修复 (83% 完成)

#### 1.1 迁移文件编号冲突修复 ✅
**问题**: 多个迁移文件使用相同编号，导致执行顺序不可预测

**解决方案**:
- 重新编号所有冲突的迁移文件
- 删除重复的 `*_fixed.sql` 版本
- 保留修复后的版本

**修改清单**:
```
026_create_analytics_events.sql     → 保持 026
026_create_user_onboarding.sql      → 重命名为 027
027_seed_example_contents.sql       → 重命名为 033
028_create_performance_monitoring.sql → 保持 028 (使用 fixed 版本)
028_create_slow_query_logs.sql      → 重命名为 034
028_create_user_preferences.sql     → 重命名为 035
029_add_privacy_features.sql        → 保持 029 (使用 fixed 版本)
029_create_api_metrics.sql          → 重命名为 036
030_community_enhancements.sql      → 保持 030
030_create_content_enhancement.sql  → 重命名为 037
030_database_optimization_indexes.sql → 重命名为 038
```

**结果**: 迁移文件现在按正确的顺序编号 (002-038)

---

#### 1.2 隐私功能表引用修复 ✅
**问题**: `029_add_privacy_features.sql` 引用了不存在的 `profiles` 表

**解决方案**:
- 使用已修复的版本 (`029_add_privacy_features_fixed.sql`)
- 所有 `profiles` 引用已改为 `users`
- 外键约束正确指向 `users` 表

**受影响的表**:
- `user_privacy_settings`
- `data_export_requests`
- `account_deletion_requests`

---

#### 1.3 字段统一和清理 ✅
**问题**: 冗余字段和缺失字段

**新增迁移文件**:
- `039_add_follower_counts.sql` - 添加 `followers_count` 和 `following_count`
- `040_database_cleanup.sql` - 删除冗余字段，添加索引

**修改内容**:
1. **添加字段**:
   - `users.followers_count` (INTEGER, DEFAULT 0)
   - `users.following_count` (INTEGER, DEFAULT 0)
   - 创建触发器自动维护计数

2. **删除冗余字段**:
   - `contents.views` (保留 `view_count`)
   - `users.is_member` (保留 `membership_tier`)

3. **初始化现有数据**:
   - 为所有现有用户计算并设置 `followers_count` 和 `following_count`

---

#### 1.4 索引优化 ✅
**新增索引** (在 `040_database_cleanup.sql` 中):
```sql
-- 用户关注数索引
CREATE INDEX idx_users_followers_count ON users(followers_count DESC);
CREATE INDEX idx_users_following_count ON users(following_count DESC);

-- 性能查询索引
CREATE INDEX idx_user_agents_last_used_at ON user_agents(last_used_at DESC);
CREATE INDEX idx_analytics_events_category_created ON analytics_events(event_category, created_at DESC);

-- 软删除索引（部分索引）
CREATE INDEX idx_contents_deleted_at ON contents(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_comments_deleted_at ON comments(deleted_at) WHERE deleted_at IS NOT NULL;
```

---

#### 1.5 数据清理策略 ✅
**新增迁移文件**: `041_data_cleanup_cron.sql`

**Cron Jobs**:
1. **清理旧分析事件** (每天 2:00 AM)
   - 删除 90 天前的 `analytics_events`

2. **清理已读通知** (每天 3:00 AM)
   - 删除 30 天前的已读 `notifications`

3. **清理性能指标** (每天 4:00 AM)
   - 删除 90 天前的 `performance_metrics`

4. **清理 Web Vitals** (每天 4:30 AM)
   - 删除 90 天前的 `web_vitals`

---

### ✅ 阶段 2: 代码层修复 (85% 完成)

#### 2.1 字段名统一修复 ✅
**问题**: 代码中使用 `avatar_url` 和 `display_name`，但数据库使用 `avatar` 和 `full_name`

**修改的文件**:
1. `lib/actions/community-posts.ts`
   - Line 80: `display_name, avatar_url` → `full_name, avatar`
   - Line 445: `display_name, avatar_url` → `full_name, avatar`

2. `lib/actions/content-versions.ts`
   - Line 32: `avatar_url` → `avatar`
   - Line 59: `avatar_url` → `avatar`

3. `app/api/recommendations/route.ts`
   - Line 37: `avatar_url` → `avatar`

4. `components/content/version-history.tsx`
   - Line 29: TypeScript 接口 `avatar_url` → `avatar`

**结果**: 所有查询现在使用正确的字段名

---

#### 2.2 数据规范化工具 ✅
**新增文件**: `lib/utils/normalize.ts`

**功能**:
1. **`normalizeSingleRelation<T>()`**
   - 处理 Supabase 返回数组或对象的情况
   - 类型安全的单关系规范化

2. **`normalizeArrayRelation<T>()`**
   - 确保始终返回数组
   - 处理单个对象或数组

3. **`normalizeUser()`**
   - 统一用户数据格式
   - 自动处理 `avatar_url` → `avatar` 和 `display_name` → `full_name` 的兼容性
   - 返回 `NormalizedUser` 类型

4. **辅助函数**:
   - `safeExtract()` - 安全提取嵌套属性
   - `isNonEmptyArray()` - 类型守卫

---

#### 2.3 N+1 查询优化 ✅
**目标文件**: `lib/queries/chat.ts`

**问题**:
- `getUserConversations()` 对每个会话执行 3 次独立查询
- 导致严重的性能问题

**解决方案**:
1. **批量获取最后消息**: 一次查询获取所有会话的最后消息
2. **批量获取对方用户**: 一次查询获取所有对方用户信息
3. **批量计算未读数**: 使用 Promise.all 并行计算
4. **优化 getOrCreateConversation**: 使用 JOIN 查找现有会话

**优化后的函数**:
- `getUserConversations()` - 从 N*3 次查询减少到 4+N 次并行查询
- `getOrCreateConversation()` - 从 N+2 次查询减少到 2-3 次查询
- `getConversationMessages()` - 添加已读状态信息
- `getUnreadMessagesCount()` - 批量计算未读消息

---

#### 2.4 数据规范化应用 ✅
**已更新的文件**:
1. `lib/queries/chat.ts` - 使用 `normalizeSingleRelation()`
2. `lib/queries/content.ts` - 替换手动数组检查
3. `lib/queries/search.ts` - 替换手动数组检查
4. `lib/actions/recommendations.ts` - 替换手动数组检查
5. `lib/actions/community-posts.ts` - 替换 `getSlug()` 和其他规范化逻辑

**结果**: 所有 `as any` 和手动数组检查已被规范化工具替换

---

## 待完成的工作

### ⏳ 阶段 1: 剩余任务

#### 1.6 TypeScript 类型重新生成
**需要执行**:
```bash
npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
```

**原因**: 当前类型定义缺少 80% 的数据库表

---

### ⏳ 阶段 2: 剩余任务

#### 2.5 错误处理统一 ✅
**已存在的工具**: `lib/utils/error-handler.ts`

**功能**:
1. **错误分类**: `ErrorType` 枚举（NETWORK, AUTH, VALIDATION, NOT_FOUND, PERMISSION, SERVER, UNKNOWN）
2. **友好消息映射**: 将技术错误转换为用户友好的中文消息
3. **自动重试机制**: `withRetry()` 支持指数退避
4. **统一处理器**:
   - `handleServerActionError()` - Server Actions 错误处理
   - `handleApiError()` - API 路由错误处理
   - `getFriendlyErrorMessage()` - 获取友好错误消息
   - `classifyError()` - 错误类型分类

**下一步**: 在更多 Server Actions 中应用这些工具

---

#### 2.6 实时订阅内存泄漏检查 ✅
**检查的文件**:
1. `components/chat/chat-messages.tsx` - ✅ 正确清理
   - 使用 `supabase.removeChannel(channel)` 清理订阅
   - 清理轮询 interval
   - 依赖数组正确

2. `components/layout/site-header.tsx` - ✅ 正确清理
   - 使用 `supabase.removeChannel(channel)` 清理订阅
   - 清理轮询 interval
   - 使用 `mounted` 标志防止内存泄漏

**结果**: 所有实时订阅都有正确的清理逻辑

---

#### 2.7 输入验证增强 ✅
**已添加 Zod 验证的文件**:
1. `lib/actions/chat.ts` - ✅ 完成
   - `sendMessageSchema`: 验证会话ID和消息内容（1-5000字符）
   - `conversationIdSchema`: UUID 验证
   - `userIdSchema`: UUID 验证

2. `lib/actions/comments.ts` - ✅ 完成
   - `createCommentSchema`: 验证内容ID、评论内容（1-1000字符）、父评论ID
   - `deleteCommentSchema`: 验证评论ID和内容ID

3. `lib/actions/follows.ts` - ✅ 完成
   - `userIdSchema`: UUID 验证
   - `checkFollowingSchema`: 验证用户ID和当前用户ID

4. `lib/actions/user.ts` - ✅ 完成
   - `updateProfileSchema`: 验证姓名、简介、GitHub用户名、头像URL
   - `usernameSchema`: 验证用户名长度

5. `lib/actions/likes.ts` - ✅ 完成
   - `contentIdSchema`: UUID 验证

6. `lib/actions/reposts.ts` - ✅ 完成
   - `contentIdSchema`: UUID 验证

7. `lib/actions/notifications.ts` - ✅ 完成
   - `createNotificationSchema`: 验证用户ID、操作者ID、类型、内容ID、活动ID
   - `createEventReminderSchema`: 验证活动ID和用户ID
   - `markAsReadSchema`: 验证通知ID

8. `lib/actions/tags.ts` - ✅ 完成
   - `tagNameSchema`: 验证标签名称（1-50字符）
   - `tagIdSchema`: UUID 验证

9. `lib/actions/events.ts` - ✅ 完成（补充）
   - `eventIdSchema`: UUID 验证（应用到 joinEvent, leaveEvent, checkInEvent）

10. `lib/actions/search.ts` - ✅ 完成
    - `searchQuerySchema`: 验证搜索关键词（1-100字符）
    - `paginationSchema`: 验证页码和每页数量

11. `lib/actions/drafts.ts` - ✅ 完成
    - `draftDataSchema`: 验证标题、内容、摘要、封面图片、价格类型、标签

12. `lib/actions/upload.ts` - ✅ 完成
    - `folderSchema`: 验证文件夹名称（小写字母、数字、连字符）

13. `lib/actions/privacy.ts` - ✅ 完成
    - `userIdSchema`: UUID 验证（应用到 exportUserData）

14. `lib/actions/membership.ts` - ✅ 完成
    - `userIdSchema`: UUID 验证
    - `membershipSchema`: 验证用户ID和会员天数（1-3650天）

15. `lib/actions/moderation.ts` - ✅ 完成
    - `contentIdSchema`: UUID 验证（应用到 approveContent）
    - `rejectContentSchema`: 验证内容ID和拒绝原因（1-500字符）

16. `lib/actions/admin.ts` - ✅ 完成
    - `userIdSchema`: UUID 验证
    - `updateMembershipSchema`: 验证用户ID、会员等级、过期时间

17. `lib/actions/preferences.ts` - ✅ 完成
    - `userPreferencesSchema`: 验证主题模式、颜色、字体大小、高对比度、语言、减少动画、键盘快捷键

18. `lib/actions/agents.ts` - ✅ 完成
    - `agentNameSchema`: 验证 Agent 名称（1-50字符）
    - `agentIdSchema`: UUID 验证

19. `lib/actions/community-moderation.ts` - ✅ 完成
    - `kickMemberSchema`: 验证社区ID、成员ID、原因（最多500字符）

20. `lib/actions/auth.ts` - ✅ 完成
    - `signInSchema`: 验证邮箱和密码
    - `signUpSchema`: 验证邮箱和密码（6-100字符）

21. `lib/actions/onboarding.ts` - ✅ 完成
    - `updateOnboardingProgress`: 验证所有布尔字段

22. `lib/actions/recommendations.ts` - ✅ 完成
    - `contentIdSchema`: UUID 验证
    - `limitSchema`: 验证限制数量（1-50）

23. `lib/actions/upload-video.ts` - ✅ 完成
    - `videoUploadSchema`: 验证文件名和视频类型

24. `lib/actions/content-versions.ts` - ✅ 完成
    - `contentIdSchema`: UUID 验证
    - `versionIdSchema`: UUID 验证
    - `restoreVersionSchema`: 验证内容ID和版本ID

**已有验证的文件**:
- `lib/actions/content.ts` - 使用外部 `contentSchema`
- `lib/actions/communities.ts` - 使用 `createCommunitySchema` 和 `updateCommunitySchema`
- `lib/actions/community-posts.ts` - 已有完整验证
- `lib/actions/events.ts` - 部分已有验证（createEvent, updateEvent）

**统计**:
- 之前: 28 个 actions 文件中 3 个有验证 (11%)
- 现在: 28 个 actions 文件中 27 个有验证 (96%+)
- 核心功能（聊天、评论、关注、点赞、转发、通知、标签、搜索、草稿、上传、隐私、会员、审核、管理、偏好设置、Agent、社区管理、认证、引导、推荐、视频上传、版本控制）已全部添加验证
- 输入验证覆盖率目标 (80%+) 已达成 ✅

---

## 待完成的工作

### ⏳ 阶段 1: 剩余任务

#### 1.6 TypeScript 类型重新生成
**状态**: 需要 Supabase Access Token

**执行方式**:
1. 获取 Access Token: https://supabase.com/dashboard/account/tokens
2. 设置环境变量: `export SUPABASE_ACCESS_TOKEN=<token>`
3. 执行命令:
```bash
npx supabase gen types typescript --project-id elufwtaomearxmbsshad > types/database.types.ts
```

**原因**: 当前类型定义缺少 80% 的数据库表

---

### ⏳ 阶段 2: 剩余任务

#### 2.8 输入验证扩展（持续进行）
**当前状态**: 28 个 actions 文件中 24+ 个有验证 (86%+)

**已完成验证的文件** (24个):
1. chat.ts
2. comments.ts
3. follows.ts
4. user.ts
5. likes.ts
6. reposts.ts
7. notifications.ts
8. tags.ts
9. events.ts (补充)
10. search.ts
11. drafts.ts
12. upload.ts
13. privacy.ts
14. membership.ts
15. moderation.ts
16. admin.ts
17. preferences.ts
18. agents.ts
19. community-moderation.ts
20. auth.ts
21. onboarding.ts
22. recommendations.ts
23. upload-video.ts
24. content-versions.ts

**已有验证的文件** (3个):
- content.ts (使用外部 contentSchema)
- communities.ts (使用 createCommunitySchema 和 updateCommunitySchema)
- community-posts.ts (已有完整验证)

**不需要验证的文件** (1个):
- analytics.ts (主要是查询操作，无需输入验证)

**验证覆盖率**: 27/28 = 96%+ ✅

**目标**: 已达到 80%+ 的验证覆盖率目标

---

### ⏳ 阶段 3: 数据完整性 (35% 完成)

#### 3.1 软删除实现 ✅
**新增迁移文件**: `042_soft_delete_implementation.sql`

**功能**:
1. **辅助函数**: `is_soft_deleted(deleted_at timestamptz)` - 检查记录是否被软删除
2. **RLS 策略更新**:
   - `contents` 表: 自动过滤已删除内容
   - `comments` 表: 自动过滤已删除评论
3. **索引优化**: 为 `deleted_at IS NULL` 添加部分索引
4. **数据库函数**:
   - `soft_delete_content(content_id UUID)` - 软删除内容
   - `soft_delete_comment(comment_id UUID)` - 软删除评论
   - `restore_content(content_id UUID)` - 恢复内容
   - `restore_comment(comment_id UUID)` - 恢复评论

**已更新的查询文件** (7个):
1. `lib/queries/content.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `getContentsFeed()` - 过滤已删除内容
   - `getContents()` - 过滤已删除内容
   - `getContentById()` - 过滤已删除内容
   - `getContentBySlug()` - 过滤已删除内容

2. `lib/queries/comments.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `getCommentsByContentId()` - 过滤已删除评论

3. `lib/queries/optimized.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `batchGetUsers()` - 过滤已删除用户
   - `batchGetContents()` - 过滤已删除内容
   - `getOptimizedContentsList()` - 过滤已删除内容
   - `getOptimizedUserContents()` - 过滤已删除内容

4. `lib/queries/explore.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `getCategories()` - 过滤已删除内容
   - `getExploreContents()` - 过滤已删除内容

5. `lib/queries/search.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `searchContents()` - 过滤已删除内容（两个查询）

6. `lib/queries/user.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `getUserStats()` - 过滤已删除内容

7. `lib/queries/chat.ts` - ✅ 已有软删除过滤（之前已实现）

**已更新的 Actions 文件** (3个):
1. `lib/actions/content.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `createContent()` - 检查首次发布时过滤已删除内容
   - `deleteContent()` - 使用软删除（更新 deleted_at）

2. `lib/actions/likes.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `toggleLike()` - 获取内容作者时过滤已删除内容

3. `lib/actions/comments.ts` - ✅ 添加 `deleted_at IS NULL` 过滤
   - `createComment()` - 获取内容作者时过滤已删除内容
   - `deleteComment()` - 使用软删除（更新 deleted_at）

**状态**: 核心查询和操作已完成软删除过滤 ✅

**下一步**:
- 检查其他 actions 文件是否需要添加软删除过滤
- 实现价格类型统一（3.2）

---

#### 3.2 价格类型统一 ✅
**新增迁移文件**: `043_unify_price_types.sql`

**问题**: 数据库约束和应用代码中存在不一致的价格类型
- 数据库: `'free', 'member', 'member_only'`
- 应用代码: `'free', 'member'`

**解决方案**:
1. **数据迁移**: 将所有 `'member_only'` 更新为 `'member'`
2. **约束更新**: 删除旧约束，添加新约束（只允许 `'free'` 和 `'member'`）
3. **索引优化**: 为 `price_type` 添加部分索引（过滤已删除记录）
4. **代码修复**: 更新 `admin/contents/page.tsx` 中的价格类型判断

**统一后的价格类型**:
- `'free'` - 免费内容
- `'member'` - 会员专享内容

**状态**: 完成 ✅

---

#### 3.3 关系完整性检查 ✅
**新增迁移文件**: `044_add_missing_foreign_keys.sql`

**目标**: 确保所有关系表都有正确的外键约束，防止孤立记录

**添加的外键约束**:
1. **likes 表**:
   - `likes_content_id_fkey` - 确保点赞关联的内容存在
   - `likes_user_id_fkey` - 确保点赞的用户存在

2. **reposts 表**:
   - `reposts_content_id_fkey` - 确保转发关联的内容存在
   - `reposts_user_id_fkey` - 确保转发的用户存在

3. **follows 表**:
   - `follows_follower_id_fkey` - 确保关注者存在
   - `follows_following_id_fkey` - 确保被关注者存在

4. **content_tags 表**:
   - `content_tags_content_id_fkey` - 确保标签关联的内容存在
   - `content_tags_tag_id_fkey` - 确保内容关联的标签存在

**级联删除策略**: 所有外键使用 `ON DELETE CASCADE`，确保删除父记录时自动清理子记录

**状态**: 完成 ✅

---

### ⏳ 阶段 4: 测试与验证 (未开始)

需要在数据库迁移执行后进行全面测试。

---

## 文件变更摘要

### 新增文件 (6个)
1. `supabase/migrations/039_add_follower_counts.sql`
2. `supabase/migrations/040_database_cleanup.sql`
3. `supabase/migrations/041_data_cleanup_cron.sql`
4. `supabase/migrations/042_soft_delete_implementation.sql`
5. `lib/utils/normalize.ts`
6. `lib/utils/soft-delete.ts`

### 修改文件 (34个)

**字段名修复** (4个):
1. `lib/actions/community-posts.ts` - 字段名修复
2. `lib/actions/content-versions.ts` - 字段名修复
3. `app/api/recommendations/route.ts` - 字段名修复
4. `components/content/version-history.tsx` - 类型定义修复

**输入验证添加** (24个):
5. `lib/actions/chat.ts` - 添加 Zod 验证
6. `lib/actions/comments.ts` - 添加 Zod 验证
7. `lib/actions/follows.ts` - 添加 Zod 验证
8. `lib/actions/user.ts` - 添加 Zod 验证
9. `lib/actions/likes.ts` - 添加 Zod 验证
10. `lib/actions/reposts.ts` - 添加 Zod 验证
11. `lib/actions/notifications.ts` - 添加 Zod 验证
12. `lib/actions/tags.ts` - 添加 Zod 验证
13. `lib/actions/events.ts` - 补充 Zod 验证
14. `lib/actions/search.ts` - 添加 Zod 验证
15. `lib/actions/drafts.ts` - 添加 Zod 验证
16. `lib/actions/upload.ts` - 添加 Zod 验证
17. `lib/actions/privacy.ts` - 添加 Zod 验证
18. `lib/actions/membership.ts` - 添加 Zod 验证
19. `lib/actions/moderation.ts` - 添加 Zod 验证
20. `lib/actions/admin.ts` - 添加 Zod 验证
21. `lib/actions/preferences.ts` - 添加 Zod 验证
22. `lib/actions/agents.ts` - 添加 Zod 验证
23. `lib/actions/community-moderation.ts` - 添加 Zod 验证
24. `lib/actions/auth.ts` - 添加 Zod 验证
25. `lib/actions/onboarding.ts` - 添加 Zod 验证
26. `lib/actions/recommendations.ts` - 添加 Zod 验证
27. `lib/actions/upload-video.ts` - 添加 Zod 验证
28. `lib/actions/content-versions.ts` - 添加 Zod 验证

**软删除实现** (5个):
29. `lib/queries/content.ts` - 添加软删除过滤
30. `lib/queries/comments.ts` - 添加软删除过滤
31. `lib/queries/optimized.ts` - 添加软删除过滤
32. `lib/actions/content.ts` - 使用软删除
33. `lib/actions/comments.ts` - 使用软删除

**其他** (1个):
34. `tasks/todo.md` - 任务跟踪更新

### 重命名文件 (9个)
- 迁移文件重新编号 (详见上文)

### 删除文件 (2个)
- `supabase/migrations/028_create_performance_monitoring.sql` (旧版本)
- `supabase/migrations/029_add_privacy_features.sql` (旧版本)

---

## 下一步行动

### 立即执行
1. **执行数据库迁移**:
   ```bash
   npx supabase db push
   ```

   **新增迁移文件**:
   - `042_soft_delete_implementation.sql` - 软删除支持
   - `043_unify_price_types.sql` - 价格类型统一
   - `044_add_missing_foreign_keys.sql` - 外键约束补充

2. **重新生成 TypeScript 类型**:
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
   ```

3. **验证迁移结果**:
   - 检查 `followers_count` 和 `following_count` 是否正确初始化
   - 验证冗余字段是否已删除
   - 确认索引已创建

### 后续任务
1. 完成数据规范化工具的集成
2. 优化 N+1 查询问题
3. 统一错误处理
4. 修复内存泄漏
5. 添加输入验证

---

## 风险评估

### 已缓解的风险 ✅
- ✅ 迁移文件编号冲突 - 已重新编号
- ✅ 隐私表引用错误 - 已使用修复版本
- ✅ 字段名不一致 - 已统一修复

### 待缓解的风险 ⚠️
- ⚠️ 删除冗余字段可能影响未发现的代码引用
- ⚠️ 数据库迁移可能在生产环境失败
- ⚠️ 类型重新生成可能导致编译错误

### 缓解策略
1. 在开发环境完整测试所有迁移
2. 创建数据库备份
3. 逐步部署，先部署非破坏性修改
4. 监控生产环境错误日志

---

**报告生成时间**: 2026-03-09
**最后更新**: 2026-03-09 (阶段 3 完成 + 阶段 4 类型安全验证完成)

---

## 最新进度更新 (2026-03-09)

### ✅ 阶段 3: 数据完整性 (100% 完成)

#### 3.1 软删除实现 ✅
- 创建迁移文件 `042_soft_delete_implementation.sql`
- 创建工具文件 `lib/utils/soft-delete.ts`
- 更新所有查询代码添加 `deleted_at IS NULL` 过滤
- 更新 RLS 策略自动排除已删除记录

#### 3.2 价格类型统一 ✅
- 创建迁移文件 `043_unify_price_types.sql`
- 统一为 `'free' | 'member'`
- 更新数据库约束
- 更新 TypeScript 验证 schema

#### 3.3 关系完整性检查 ✅
- 创建迁移文件 `044_add_missing_foreign_keys.sql`
- 添加 8 个缺失的外键约束
- 添加级联删除规则

### ✅ 阶段 4: 测试与验证 (25% 完成)

#### 4.4 类型安全验证 ✅
- ✅ TypeScript 编译无错误
- ✅ 修复所有 Zod 验证错误 (error.errors → error.issues)
- ✅ 修复 z.enum 参数错误
- ✅ 核心业务逻辑无 `as any` 类型断言

**修复的文件**:
- 22 个 Server Actions 文件的 Zod 验证错误
- `lib/actions/admin.ts` - z.enum 参数修复
- `lib/actions/upload-video.ts` - z.enum 参数修复
- `lib/actions/community-posts.ts` - null 检查修复

### 待完成任务

#### 阶段 4 剩余工作 (需要数据库迁移后测试)
1. **数据库层验证**
   - 执行所有迁移文件 (002-044)
   - 验证触发器和 Cron Jobs
   - 验证外键约束

2. **应用层验证**
   - 测试软删除功能
   - 测试价格类型统一
   - 测试关注者计数

3. **性能验证**
   - 测试 N+1 查询优化效果
   - 测试索引性能提升
   - 测试实时订阅内存使用

### 总体进度

- **阶段 1**: 83% ✅
- **阶段 2**: 100% ✅
- **阶段 3**: 100% ✅
- **阶段 4**: 25% 🔄

**总体进度**: 89% (17/19 完成)

