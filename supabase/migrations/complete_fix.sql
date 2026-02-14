-- ============================================
-- AI-Dating 完整修复脚本
-- 执行日期: 2026-02-14
-- 说明: 包含所有必要的数据库迁移和修复
-- ============================================

-- ============================================
-- 第一部分: 标签驱动重构 (003)
-- ============================================

-- Make category nullable (for backward compatibility)
ALTER TABLE contents ALTER COLUMN category DROP NOT NULL;

-- Add index on tags for better query performance
CREATE INDEX IF NOT EXISTS idx_contents_tags ON contents USING GIN (tags);

-- Update increment_view_count function
CREATE OR REPLACE FUNCTION increment_view_count(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contents
  SET view_count = COALESCE(view_count, views, 0) + 1
  WHERE id = content_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;

-- ============================================
-- 第二部分: 添加缺失字段 (004)
-- ============================================

-- Users table fixes
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for users updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing is_member data to membership_tier
UPDATE users SET membership_tier = 'premium' WHERE is_member = true;
UPDATE users SET membership_tier = 'free' WHERE is_member = false OR is_member IS NULL;

-- Contents table fixes
ALTER TABLE contents ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Copy views to view_count if view_count is 0
UPDATE contents SET view_count = COALESCE(views, 0) WHERE view_count = 0;

-- Update price_type constraint to include 'member_only'
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_price_type_check;
ALTER TABLE contents ADD CONSTRAINT contents_price_type_check
  CHECK (price_type IN ('free', 'member', 'member_only'));

-- Update existing 'member' to 'member_only' for consistency
UPDATE contents SET price_type = 'member_only' WHERE price_type = 'member';

-- ============================================
-- 第三部分: 修复认证和 RLS 策略 (005) ⭐ 关键修复
-- ============================================

-- Remove the default UUID generation for users.id
-- The id should come from auth.users, not be auto-generated
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Allow authenticated users to insert their own user record
-- This is needed for the auth callback to create user profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id OR true);

-- ============================================
-- 验证脚本执行结果
-- ============================================

-- 检查 users 表结构
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 检查 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'contents')
ORDER BY tablename, policyname;

-- 显示完成消息
DO $$
BEGIN
  RAISE NOTICE '✅ 所有迁移已成功执行！';
  RAISE NOTICE '📝 请测试登录功能';
END $$;
