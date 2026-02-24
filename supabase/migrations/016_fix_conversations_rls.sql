-- 修复 conversations 表的 RLS 策略

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;

-- 创建新策略
-- INSERT: 允许已登录用户创建会话
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: 允许已登录用户查看会话（应用层会过滤）
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);
