-- =====================================================
-- 社区系统数据库迁移
-- 创建时间: 2026-02-20
-- 描述: 创建社区/群组功能所需的所有表、触发器和 RLS 策略
-- =====================================================

-- =====================================================
-- 1. 创建 communities 表
-- =====================================================
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  cover_url TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private')),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  members_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT communities_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
  CONSTRAINT communities_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 创建索引
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_creator_id ON communities(creator_id);
CREATE INDEX idx_communities_type ON communities(type);
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);

-- =====================================================
-- 2. 创建 community_members 表
-- =====================================================
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

-- 创建索引
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(community_id, role);

-- =====================================================
-- 3. 创建 community_posts 表
-- =====================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  images TEXT[],
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT community_posts_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 10000),
  CONSTRAINT community_posts_title_length CHECK (title IS NULL OR (char_length(title) >= 1 AND char_length(title) <= 200))
);

-- 创建索引
CREATE INDEX idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_pinned ON community_posts(community_id, is_pinned, created_at DESC);

-- =====================================================
-- 4. 创建 community_post_likes 表
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

-- 创建索引
CREATE INDEX idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX idx_community_post_likes_user_id ON community_post_likes(user_id);

-- =====================================================
-- 5. 创建 community_post_comments 表
-- =====================================================
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT community_post_comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- 创建索引
CREATE INDEX idx_community_post_comments_post_id ON community_post_comments(post_id);
CREATE INDEX idx_community_post_comments_author_id ON community_post_comments(author_id);
CREATE INDEX idx_community_post_comments_created_at ON community_post_comments(created_at DESC);

-- =====================================================
-- 6. 创建 community_invitations 表
-- =====================================================
CREATE TABLE IF NOT EXISTS community_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(community_id, invitee_id)
);

-- 创建索引
CREATE INDEX idx_community_invitations_community_id ON community_invitations(community_id);
CREATE INDEX idx_community_invitations_invitee_id ON community_invitations(invitee_id);
CREATE INDEX idx_community_invitations_status ON community_invitations(status);

-- =====================================================
-- 7. 创建触发器函数
-- =====================================================

-- 更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新社区成员数
CREATE OR REPLACE FUNCTION update_community_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET members_count = members_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET members_count = members_count - 1
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 更新社区帖子数
CREATE OR REPLACE FUNCTION update_community_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET posts_count = posts_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET posts_count = posts_count - 1
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 更新帖子点赞数
CREATE OR REPLACE FUNCTION update_community_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 更新帖子评论数
CREATE OR REPLACE FUNCTION update_community_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 自动添加创建者为管理员
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. 创建触发器
-- =====================================================

-- communities 表触发器
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER add_creator_as_admin_trigger
  AFTER INSERT ON communities
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_admin();

-- community_members 表触发器
CREATE TRIGGER update_members_count_on_insert
  AFTER INSERT ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_members_count();

CREATE TRIGGER update_members_count_on_delete
  AFTER DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_members_count();

-- community_posts 表触发器
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_count_on_insert
  AFTER INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_posts_count();

CREATE TRIGGER update_posts_count_on_delete
  AFTER DELETE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_posts_count();

-- community_post_likes 表触发器
CREATE TRIGGER update_likes_count_on_insert
  AFTER INSERT ON community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_likes_count();

CREATE TRIGGER update_likes_count_on_delete
  AFTER DELETE ON community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_likes_count();

-- community_post_comments 表触发器
CREATE TRIGGER update_community_post_comments_updated_at
  BEFORE UPDATE ON community_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_count_on_insert
  AFTER INSERT ON community_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_comments_count();

CREATE TRIGGER update_comments_count_on_delete
  AFTER DELETE ON community_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_community_post_comments_count();

-- community_invitations 表触发器
CREATE TRIGGER update_community_invitations_updated_at
  BEFORE UPDATE ON community_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. 启用 RLS
-- =====================================================

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. 创建 RLS 策略 - communities 表
-- =====================================================

-- SELECT: 公开社区所有人可见，私密社区只有成员可见
CREATE POLICY "Anyone can view public communities"
  ON communities FOR SELECT
  USING (
    type = 'public'
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
      AND community_members.user_id = auth.uid()
    )
  );

-- INSERT: 已登录用户可以创建社区
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND creator_id = auth.uid());

-- UPDATE: 只有管理员可以更新社区信息
CREATE POLICY "Admins can update communities"
  ON communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
      AND community_members.user_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

-- DELETE: 只有管理员可以删除社区
CREATE POLICY "Admins can delete communities"
  ON communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
      AND community_members.user_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

-- =====================================================
-- 11. 创建 RLS 策略 - community_members 表
-- =====================================================

-- SELECT: 公开社区的成员所有人可见，私密社区只有成员可见
CREATE POLICY "Anyone can view public community members"
  ON community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND (
        communities.type = 'public'
        OR EXISTS (
          SELECT 1 FROM community_members cm
          WHERE cm.community_id = communities.id
          AND cm.user_id = auth.uid()
        )
      )
    )
  );

-- INSERT: 用户可以加入公开社区，私密社区需要邀请
CREATE POLICY "Users can join public communities"
  ON community_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM communities
        WHERE communities.id = community_members.community_id
        AND communities.type = 'public'
      )
      OR EXISTS (
        SELECT 1 FROM community_invitations
        WHERE community_invitations.community_id = community_members.community_id
        AND community_invitations.invitee_id = auth.uid()
        AND community_invitations.status = 'accepted'
      )
    )
  );

-- UPDATE: 管理员可以修改成员角色
CREATE POLICY "Admins can update member roles"
  ON community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- DELETE: 用户可以退出社区，管理员/版主可以移除成员
CREATE POLICY "Users can leave or be removed from communities"
  ON community_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- 12. 创建 RLS 策略 - community_posts 表
-- =====================================================

-- SELECT: 公开社区的帖子所有人可见，私密社区只有成员可见
CREATE POLICY "Anyone can view public community posts"
  ON community_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_posts.community_id
      AND (
        communities.type = 'public'
        OR EXISTS (
          SELECT 1 FROM community_members
          WHERE community_members.community_id = communities.id
          AND community_members.user_id = auth.uid()
        )
      )
    )
  );

-- INSERT: 只有社区成员可以发帖
CREATE POLICY "Community members can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_posts.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- UPDATE: 作者可以编辑自己的帖子，管理员/版主可以置顶/锁定帖子
CREATE POLICY "Authors and moderators can update posts"
  ON community_posts FOR UPDATE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_posts.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- DELETE: 作者可以删除自己的帖子，管理员/版主可以删除任何帖子
CREATE POLICY "Authors and moderators can delete posts"
  ON community_posts FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_posts.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- 13. 创建 RLS 策略 - community_post_likes 表
-- =====================================================

-- SELECT: 所有人可以查看点赞
CREATE POLICY "Anyone can view post likes"
  ON community_post_likes FOR SELECT
  USING (true);

-- INSERT: 已登录用户可以点赞
CREATE POLICY "Authenticated users can like posts"
  ON community_post_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- DELETE: 用户可以取消自己的点赞
CREATE POLICY "Users can unlike posts"
  ON community_post_likes FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 14. 创建 RLS 策略 - community_post_comments 表
-- =====================================================

-- SELECT: 所有人可以查看评论
CREATE POLICY "Anyone can view post comments"
  ON community_post_comments FOR SELECT
  USING (true);

-- INSERT: 已登录用户可以评论
CREATE POLICY "Authenticated users can comment on posts"
  ON community_post_comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- UPDATE: 作者可以编辑自己的评论
CREATE POLICY "Authors can update their comments"
  ON community_post_comments FOR UPDATE
  USING (author_id = auth.uid());

-- DELETE: 作者可以删除自己的评论，管理员/版主可以删除任何评论
CREATE POLICY "Authors and moderators can delete comments"
  ON community_post_comments FOR DELETE
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_posts
      JOIN community_members ON community_members.community_id = community_posts.community_id
      WHERE community_posts.id = community_post_comments.post_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- 15. 创建 RLS 策略 - community_invitations 表
-- =====================================================

-- SELECT: 邀请者和被邀请者可以查看邀请
CREATE POLICY "Users can view their invitations"
  ON community_invitations FOR SELECT
  USING (
    inviter_id = auth.uid()
    OR invitee_id = auth.uid()
  );

-- INSERT: 管理员/版主可以邀请用户
CREATE POLICY "Admins and moderators can invite users"
  ON community_invitations FOR INSERT
  WITH CHECK (
    inviter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_invitations.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- UPDATE: 被邀请者可以接受/拒绝邀请
CREATE POLICY "Invitees can update invitation status"
  ON community_invitations FOR UPDATE
  USING (invitee_id = auth.uid());

-- DELETE: 邀请者可以撤销邀请
CREATE POLICY "Inviters can delete invitations"
  ON community_invitations FOR DELETE
  USING (inviter_id = auth.uid());

-- =====================================================
-- 16. 创建辅助函数
-- =====================================================

-- 检查用户是否是社区成员
CREATE OR REPLACE FUNCTION is_community_member(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = community_id_param
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户在社区中的角色
CREATE OR REPLACE FUNCTION get_community_role(community_id_param UUID, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM community_members
  WHERE community_id = community_id_param
  AND user_id = user_id_param;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否有权限管理社区
CREATE OR REPLACE FUNCTION can_manage_community(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = community_id_param
    AND user_id = user_id_param
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 迁移完成
-- =====================================================

