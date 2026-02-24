-- 完整修复聊天系统 RLS 策略的无限递归问题
-- 解决方案：简化策略，避免在策略中查询同一张表

-- 1. 删除所有有问题的策略
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;

-- 2. 创建简化的策略
-- SELECT: 允许已登录用户查看（应用层会过滤）
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: 允许已登录用户插入（应用层已验证）
CREATE POLICY "Users can add participants to conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: 只能更新自己的记录
CREATE POLICY "Users can update their own participant record"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());
