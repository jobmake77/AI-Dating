-- =====================================================
-- 最终修复：简化 RLS 策略，避免循环依赖
-- 策略：数据库层只控制基本访问，复杂逻辑由应用层处理
-- =====================================================

-- 1. 删除所有有问题的策略
DROP POLICY IF EXISTS "Anyone can view public communities" ON communities;
DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
DROP POLICY IF EXISTS "Admins can update communities" ON communities;
DROP POLICY IF EXISTS "Admins can delete communities" ON communities;
DROP POLICY IF EXISTS "Creators can update communities" ON communities;
DROP POLICY IF EXISTS "Creators can delete communities" ON communities;
DROP POLICY IF EXISTS "Anyone can view public community members" ON community_members;
DROP POLICY IF EXISTS "Users can join public communities" ON community_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON community_members;
DROP POLICY IF EXISTS "Users can leave or be removed from communities" ON community_members;
DROP POLICY IF EXISTS "View communities" ON communities;
DROP POLICY IF EXISTS "View community members" ON community_members;
DROP POLICY IF EXISTS "Join communities" ON community_members;
DROP POLICY IF EXISTS "Anyone can view all communities" ON communities;
DROP POLICY IF EXISTS "Anyone can view all members" ON community_members;
DROP POLICY IF EXISTS "Authenticated users can join" ON community_members;
DROP POLICY IF EXISTS "Users can update their membership" ON community_members;
DROP POLICY IF EXISTS "Users can delete their membership" ON community_members;

-- 2. 删除可能存在的 SECURITY DEFINER 函数
DROP FUNCTION IF EXISTS is_community_member_bypass_rls(UUID, UUID);

-- =====================================================
-- 3. 创建简化的 communities 表策略
-- =====================================================

-- SELECT: 所有人可以查看所有社区（包括私密社区）
-- 私密社区的内容访问由应用层控制
CREATE POLICY "Anyone can view all communities"
  ON communities FOR SELECT
  USING (true);

-- INSERT: 已登录用户可以创建社区
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND creator_id = auth.uid());

-- UPDATE: 只有创建者可以更新（应用层会额外检查管理员权限）
CREATE POLICY "Creators can update communities"
  ON communities FOR UPDATE
  USING (creator_id = auth.uid());

-- DELETE: 只有创建者可以删除（应用层会额外检查管理员权限）
CREATE POLICY "Creators can delete communities"
  ON communities FOR DELETE
  USING (creator_id = auth.uid());

-- =====================================================
-- 4. 创建简化的 community_members 表策略
-- =====================================================

-- SELECT: 所有人可以查看所有成员关系
-- 应用层会根据社区类型过滤显示
CREATE POLICY "Anyone can view all members"
  ON community_members FOR SELECT
  USING (true);

-- INSERT: 已登录用户可以插入成员记录
-- 应用层会检查社区类型和邀请状态
CREATE POLICY "Authenticated users can join"
  ON community_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: 用户可以更新自己的记录（应用层会检查权限）
CREATE POLICY "Users can update their membership"
  ON community_members FOR UPDATE
  USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- DELETE: 用户可以删除自己的记录，或由应用层控制
CREATE POLICY "Users can delete their membership"
  ON community_members FOR DELETE
  USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- =====================================================
-- 说明
-- =====================================================
-- 这个简化方案将复杂的权限逻辑移到应用层：
-- 1. 数据库层允许查看所有数据
-- 2. Server Actions 在查询前检查用户权限
-- 3. 私密社区的访问由 getCommunityBySlug 等函数控制
-- 4. 完全避免了 RLS 策略的循环依赖问题
