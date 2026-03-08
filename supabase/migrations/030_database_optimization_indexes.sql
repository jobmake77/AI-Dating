-- =====================================================
-- 数据库优化 - 索引优化
-- 创建时间: 2026-03-08
-- 描述: 添加缺失的索引以优化查询性能
-- =====================================================

-- =====================================================
-- 1. Contents 表索引优化
-- =====================================================

-- 优化内容列表查询（按状态和创建时间排序）
CREATE INDEX IF NOT EXISTS idx_contents_status_created_at
ON contents(status, created_at DESC);

-- 优化标签搜索（使用 GIN 索引支持数组查询）
CREATE INDEX IF NOT EXISTS idx_contents_tags_gin
ON contents USING GIN(tags);

-- 优化作者内容查询（按作者和状态）
CREATE INDEX IF NOT EXISTS idx_contents_author_status
ON contents(author_id, status);

-- 优化 slug 查询
CREATE INDEX IF NOT EXISTS idx_contents_slug
ON contents(slug);

-- 优化全文搜索（标题、摘要、内容）
CREATE INDEX IF NOT EXISTS idx_contents_title_trgm
ON contents USING GIN(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contents_excerpt_trgm
ON contents USING GIN(excerpt gin_trgm_ops);

-- 优化视图数和点赞数排序
CREATE INDEX IF NOT EXISTS idx_contents_views_desc
ON contents(views DESC) WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_contents_likes_desc
ON contents(likes_count DESC) WHERE status = 'approved';

-- =====================================================
-- 2. Likes 表索引优化
-- =====================================================

-- 优化用户点赞内容查询
CREATE INDEX IF NOT EXISTS idx_likes_user_created
ON likes(user_id, created_at DESC);

-- 优化内容点赞查询
CREATE INDEX IF NOT EXISTS idx_likes_content_user
ON likes(content_id, user_id);

-- =====================================================
-- 3. Reposts 表索引优化
-- =====================================================

-- 优化用户转发内容查询
CREATE INDEX IF NOT EXISTS idx_reposts_user_created
ON reposts(user_id, created_at DESC);

-- 优化内容转发查询
CREATE INDEX IF NOT EXISTS idx_reposts_content_user
ON reposts(content_id, user_id);

-- =====================================================
-- 4. Comments 表索引优化
-- =====================================================

-- 优化内容评论查询（包含父评论）
CREATE INDEX IF NOT EXISTS idx_comments_content_parent
ON comments(content_id, parent_id, created_at);

-- 优化用户评论查询
CREATE INDEX IF NOT EXISTS idx_comments_user_created
ON comments(user_id, created_at DESC);

-- =====================================================
-- 5. Follows 表索引优化
-- =====================================================

-- 优化关注者查询
CREATE INDEX IF NOT EXISTS idx_follows_follower_created
ON follows(follower_id, created_at DESC);

-- 优化被关注者查询
CREATE INDEX IF NOT EXISTS idx_follows_following_created
ON follows(following_id, created_at DESC);

-- 优化关注关系查询
CREATE INDEX IF NOT EXISTS idx_follows_relationship
ON follows(follower_id, following_id);

-- =====================================================
-- 6. Community Members 表索引优化
-- =====================================================

-- 优化社区成员角色查询
CREATE INDEX IF NOT EXISTS idx_community_members_community_role
ON community_members(community_id, role, joined_at DESC);

-- 优化用户社区查询
CREATE INDEX IF NOT EXISTS idx_community_members_user_joined
ON community_members(user_id, joined_at DESC);

-- =====================================================
-- 7. Community Posts 表索引优化
-- =====================================================

-- 优化社区帖子查询（包含置顶）
CREATE INDEX IF NOT EXISTS idx_community_posts_community_pinned_created
ON community_posts(community_id, is_pinned DESC, created_at DESC);

-- 优化作者帖子查询
CREATE INDEX IF NOT EXISTS idx_community_posts_author_created
ON community_posts(author_id, created_at DESC);

-- =====================================================
-- 8. Messages 表索引优化
-- =====================================================

-- 优化会话消息查询
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages(conversation_id, created_at);

-- 优化发送者消息查询
CREATE INDEX IF NOT EXISTS idx_messages_sender_created
ON messages(sender_id, created_at DESC);

-- =====================================================
-- 9. Conversation Participants 表索引优化
-- =====================================================

-- 优化用户会话查询
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
ON conversation_participants(user_id, last_read_at);

-- 优化会话参与者查询
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation
ON conversation_participants(conversation_id, user_id);

-- =====================================================
-- 10. Events 表索引优化
-- =====================================================

-- 优化活动类型和时间查询
CREATE INDEX IF NOT EXISTS idx_events_type_status_start
ON events(type, status, start_time);

-- 优化创建者活动查询
CREATE INDEX IF NOT EXISTS idx_events_creator_created
ON events(creator_id, created_at DESC);

-- =====================================================
-- 11. Event Participants 表索引优化
-- =====================================================

-- 优化用户参与活动查询
CREATE INDEX IF NOT EXISTS idx_event_participants_user_joined
ON event_participants(user_id, joined_at DESC);

-- 优化活动参与者查询
CREATE INDEX IF NOT EXISTS idx_event_participants_event_joined
ON event_participants(event_id, joined_at DESC);

-- =====================================================
-- 12. Notifications 表索引优化
-- =====================================================

-- 优化用户通知查询（按已读状态和时间）
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications(user_id, is_read, created_at DESC);

-- 优化未读通知查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
ON notifications(user_id, created_at DESC) WHERE is_read = false;

-- =====================================================
-- 13. 启用 pg_trgm 扩展（用于全文搜索）
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
