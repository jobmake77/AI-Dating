-- 检查 user_onboarding 表和数据
-- 在 Supabase SQL Editor 中运行

-- 1. 检查表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_onboarding'
) as table_exists;

-- 2. 查看表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_onboarding'
ORDER BY ordinal_position;

-- 3. 检查 RLS 是否启用
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_onboarding';

-- 4. 查看 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_onboarding';

-- 5. 查看现有记录数量
SELECT COUNT(*) as total_records
FROM user_onboarding;

-- 6. 查看最近的记录（如果有）
SELECT *
FROM user_onboarding
ORDER BY created_at DESC
LIMIT 5;

-- 7. 检查触发器
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_onboarding';

-- 8. 测试插入（使用实际的 user_id）
-- 注意：需要替换 'YOUR_USER_ID' 为实际的用户 ID
-- INSERT INTO user_onboarding (user_id)
-- VALUES ('YOUR_USER_ID')
-- ON CONFLICT (user_id) DO NOTHING
-- RETURNING *;
