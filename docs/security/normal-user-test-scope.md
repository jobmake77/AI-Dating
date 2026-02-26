# 普通用户需验证的功能点与接口清单（基于代码）

> 说明：本项目主要通过 **Server Actions** 处理业务逻辑（非传统 REST API）。
> 下面按“功能点 → 对应 Server Action（文件/函数）→ 相关页面路径”整理。

## 1) 账号与登录
- **邮箱登录** → `/Users/a77/Desktop/AI-Dating/lib/actions/auth.ts` `signInWithEmail`
- **邮箱注册** → `/Users/a77/Desktop/AI-Dating/lib/actions/auth.ts` `signUpWithEmail`
- **GitHub OAuth 登录** → `/Users/a77/Desktop/AI-Dating/lib/actions/auth.ts` `signInWithGitHub`
- **回调地址** → `/auth/callback`（`app/auth/callback/route.ts`）
- **页面**：`/login`、`/login-client`

## 2) 个人资料
- **更新资料** → `lib/actions/user.ts` `updateUserProfile`
- **访问用户主页** → `/u/[username]`
- **关注/粉丝列表** → `/u/[username]/following`、`/u/[username]/followers`

## 3) 内容发布与管理
- **创建内容** → `lib/actions/content.ts` `createContent`
- **编辑内容** → `lib/actions/content.ts` `updateContent`
- **删除内容** → `lib/actions/content.ts` `deleteContent`
- **浏览计数** → `lib/actions/content.ts` `incrementViewCount`
- **页面**：`/create`、`/edit/[id]`、`/post/[id]`、`/contents`

## 4) 评论
- **发表评论** → `lib/actions/comments.ts` `createComment`
- **删除评论** → `lib/actions/comments.ts` `deleteComment`
- **页面**：`/post/[id]`

## 5) 点赞与转发
- **点赞/取消点赞** → `lib/actions/likes.ts` `toggleLike`
- **转发/取消转发** → `lib/actions/reposts.ts` `toggleRepost`
- **页面**：`/post/[id]`

## 6) 关注
- **关注/取消关注** → `lib/actions/follows.ts` `toggleFollow`
- **页面**：`/u/[username]`

## 7) 社区（Communities）
- **创建社区** → `lib/actions/communities.ts` `createCommunity`
- **更新社区** → `lib/actions/communities.ts` `updateCommunity`
- **删除社区** → `lib/actions/communities.ts` `deleteCommunity`
- **加入/退出社区** → `lib/actions/communities.ts` `joinCommunity` / `leaveCommunity`
- **成员管理（普通用户通常无权限）** → `updateMemberRole` / `removeMember`
- **页面**：`/communities`、`/communities/create`、`/communities/[slug]`、`/communities/[slug]/settings`

## 8) 社区帖子
- **创建帖子** → `lib/actions/community-posts.ts` `createCommunityPost`
- **更新/删除帖子** → `updateCommunityPost` / `deleteCommunityPost`
- **点赞/置顶/锁定** → `togglePostLike` / `togglePostPin` / `togglePostLock`
- **帖子评论** → `createPostComment` / `deletePostComment`
- **页面**：`/communities/[slug]/posts/create`、`/communities/[slug]/posts/[id]`

## 9) 私信/聊天
- **发送消息** → `lib/actions/chat.ts` `sendMessage`
- **标记已读** → `markConversationAsRead`
- **创建会话** → `createConversationWithUser`
- **未读计数** → `getUnreadMessagesCount`
- **页面**：`/messages`、`/messages/[id]`

## 10) 通知
- **获取通知** → `lib/actions/notifications.ts` `getNotifications`
- **未读数** → `getUnreadCount`
- **标记已读** → `markAsRead` / `markAllAsRead` / `markAllAsReadSilent`
- **删除通知** → `deleteNotification`
- **页面**：`/notifications`

## 11) 搜索与推荐
- **搜索内容** → `lib/actions/search.ts` `searchContents`
- **搜索用户** → `lib/actions/search.ts` `searchUsers`
- **搜索综合** → `lib/actions/search.ts` `searchAll`
- **推荐内容** → `lib/actions/recommendations.ts` `getRecommendedContents`
- **相关内容** → `getRelatedContents`
- **趋势内容** → `getTrendingContents`
- **页面**：`/search`、`/trending`

## 12) 标签
- **创建/获取标签** → `lib/actions/tags.ts` `createOrGetTag`
- **内容标签管理** → `addTagsToContent` / `removeTagFromContent` / `getContentTags`
- **标签搜索** → `searchTags`
- **页面**：`/tag/[name]`

## 13) 上传
- **图片上传** → `lib/actions/upload.ts` `uploadImage`
- **视频上传预签名** → `lib/actions/upload-video.ts` `getVideoUploadUrl`
- **触发页面**：内容创建/编辑等表单

## 14) 活动（Events）
- **创建活动** → `lib/actions/events.ts` `createEvent`
- **页面**：`/events`、`/events/create`、`/events/[id]`

## 15) 会员相关（普通用户可见）
- **会员状态查询** → `lib/actions/membership.ts` `checkUserMembership`
- **页面**：`/pricing`

## 16) 需要谨慎验证的路径（普通用户）
- `/admin/*` 与 `lib/actions/admin.ts`（普通用户应被拒绝）
- `/api/admin/set-admin`（普通用户应被拒绝）
- `lib/actions/moderation.ts`（普通用户应被拒绝）
- `lib/actions/membership.ts` 中的管理类操作（普通用户应被拒绝）

---

如果你需要我基于该清单生成“测试用例矩阵”或“自动化脚本计划”，告诉我范围与优先级即可。
