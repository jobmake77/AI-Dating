# 社区功能使用指南

## 快速开始

### 1. 运行数据库迁移

```bash
# 连接到 Supabase 项目
supabase link --project-ref your-project-ref

# 运行迁移
supabase db push
```

或者在 Supabase Dashboard 的 SQL Editor 中执行:
```sql
-- 复制并执行 supabase/migrations/018_create_communities_system.sql 的内容
```

### 2. 启动应用

```bash
npm run dev
```

### 3. 访问社区功能

打开浏览器访问: http://localhost:3000/communities

---

## 功能概览

### 用户功能
- ✅ 浏览公开社区
- ✅ 创建社区 (公开/私密)
- ✅ 加入/退出社区
- ✅ 发布帖子
- ✅ 点赞和评论
- ✅ 查看成员列表

### 管理员功能
- ✅ 编辑社区信息
- ✅ 管理成员角色
- ✅ 移除成员
- ✅ 置顶/锁定帖子
- ✅ 删除帖子和评论
- ✅ 删除社区

### 版主功能
- ✅ 置顶/锁定帖子
- ✅ 删除帖子和评论
- ✅ 移除普通成员

---

## 页面路由

| 路由 | 功能 | 权限 |
|------|------|------|
| `/communities` | 社区列表 | 所有人 |
| `/communities/create` | 创建社区 | 已登录用户 |
| `/communities/[slug]` | 社区详情 | 公开社区:所有人<br>私密社区:成员 |
| `/communities/[slug]/posts/create` | 创建帖子 | 社区成员 |
| `/communities/[slug]/posts/[id]` | 帖子详情 | 同社区详情 |
| `/communities/[slug]/members` | 成员列表 | 同社区详情 |
| `/communities/[slug]/settings` | 社区设置 | 管理员 |

---

## 权限说明

### Admin (管理员)
- 创建者默认为管理员
- 可以修改社区信息
- 可以管理成员 (添加/移除/修改角色)
- 可以置顶/锁定/删除任何帖子
- 可以删除社区

### Moderator (版主)
- 可以置顶/锁定/删除帖子
- 可以移除成员 (不能移除管理员)
- 可以删除评论

### Member (普通成员)
- 可以发帖、评论、点赞
- 可以编辑/删除自己的帖子
- 可以删除自己的评论

---

## 常见问题

### Q: 如何创建社区?
A: 登录后访问 `/communities`，点击"创建社区"按钮。

### Q: 如何上传图片?
A: 当前需要手动输入图片 URL。后续会添加图片上传功能。

### Q: 私密社区如何邀请成员?
A: 邀请功能的 UI 尚未实现，但数据库表已创建。可以通过 SQL 手动添加邀请记录。

### Q: 如何删除社区?
A: 只有管理员可以删除社区。访问 `/communities/[slug]/settings`，在页面底部有删除按钮。

### Q: 帖子被锁定后还能评论吗?
A: 不能。锁定的帖子无法添加新评论。

---

## 技术细节

### 数据库表
- `communities` - 社区基本信息
- `community_members` - 社区成员关系
- `community_posts` - 社区帖子
- `community_post_likes` - 帖子点赞
- `community_post_comments` - 帖子评论
- `community_invitations` - 社区邀请

### RLS 策略
所有表都启用了 Row Level Security，确保数据安全。

### 触发器
- 自动更新成员数
- 自动更新帖子数
- 自动更新点赞数
- 自动更新评论数
- 自动添加创建者为管理员

---

## 待完成功能

- [ ] 图片上传功能
- [ ] 社区邀请 UI
- [ ] 通知集成
- [ ] 搜索功能 UI
- [ ] 分页组件
- [ ] 社区分类和标签

---

## 相关文档

- [实施完成报告](./community-implementation-summary.md)
- [实施进度报告](./community-implementation-progress.md)
- [数据库迁移文件](../supabase/migrations/018_create_communities_system.sql)

---

**版本**: 1.0.0
**最后更新**: 2026-02-20
