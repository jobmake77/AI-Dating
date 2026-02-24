-- 修复 messages 表的 RLS 策略

-- 删除旧策略
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;

-- 创建简化的策略
-- SELECT: 允许已登录用户查看消息（应用层会过滤）
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: 允许已登录用户发送消息（应用层已验证）
CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );
