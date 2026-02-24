-- =====================================================
-- 修复 community_members 表的 RLS 策略无限递归问题
-- =====================================================

-- 删除有问题的策略
DROP POLICY IF EXISTS "Anyone can view public community members" ON community_members;
DROP POLICY IF EXISTS "Users can join public communities" ON community_members;

-- 创建简化的策略，避免递归

-- SELECT: 允许查看公开社区的成员，或用户自己的成员记录
CREATE POLICY "View community members"
  ON community_members FOR SELECT
  USING (
    -- 用户可以查看自己的成员记录
    user_id = auth.uid()
    OR
    -- 或者查看公开社区的成员
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.type = 'public'
    )
  );

-- INSERT: 用户可以加入公开社区
CREATE POLICY "Join public communities"
  ON community_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.type = 'public'
    )
  );
