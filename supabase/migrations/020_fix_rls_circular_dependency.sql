-- =====================================================
-- 彻底修复 RLS 策略的循环依赖问题
-- 使用 SECURITY DEFINER 函数打破循环
-- =====================================================

-- 1. 删除所有有问题的策略
DROP POLICY IF EXISTS "Anyone can view public communities" ON communities;
DROP POLICY IF EXISTS "View community members" ON community_members;
DROP POLICY IF EXISTS "Join public communities" ON community_members;

-- 2. 创建 SECURITY DEFINER 函数来检查成员关系
-- 这个函数绕过 RLS，直接查询数据库
CREATE OR REPLACE FUNCTION is_community_member_bypass_rls(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = community_id_param
    AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建简化的 communities 策略
-- 使用 SECURITY DEFINER 函数避免递归
CREATE POLICY "View communities"
  ON communities FOR SELECT
  USING (
    type = 'public'
    OR is_community_member_bypass_rls(id, auth.uid())
  );

-- 4. 创建简化的 community_members 策略
-- 不再查询 communities 表，避免循环
CREATE POLICY "View community members"
  ON community_members FOR SELECT
  USING (
    -- 用户可以查看自己的成员记录
    user_id = auth.uid()
    OR
    -- 或者用户是同一个社区的成员（使用 SECURITY DEFINER 函数）
    is_community_member_bypass_rls(community_id, auth.uid())
  );

-- 5. 重新创建 INSERT 策略
CREATE POLICY "Join communities"
  ON community_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- 注意：应用层需要在加入社区前检查社区类型
-- 私密社区的加入逻辑由应用层的 Server Actions 控制
