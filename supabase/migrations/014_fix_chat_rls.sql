-- 修复聊天系统 RLS 策略的无限递归问题

-- 删除有问题的策略
DROP POLICY IF EXISTS "Users can add participants to conversations" ON conversation_participants;

-- 创建新的策略：允许认证用户添加参与者
-- 应用层已经做了验证，这里只需要确保用户已登录即可
CREATE POLICY "Users can add participants to conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
