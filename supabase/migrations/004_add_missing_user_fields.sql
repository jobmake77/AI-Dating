-- Day 2 Fix: Add missing fields and fix field names

-- ============================================
-- Users table fixes
-- ============================================

-- Add full_name field
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add github_username field
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username TEXT;

-- Add membership_tier field (to replace is_member boolean)
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium'));

-- Add updated_at field
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for users updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing is_member data to membership_tier
UPDATE users SET membership_tier = 'premium' WHERE is_member = true;
UPDATE users SET membership_tier = 'free' WHERE is_member = false OR is_member IS NULL;

-- ============================================
-- Contents table fixes
-- ============================================

-- Add view_count as alias for views (for backward compatibility)
ALTER TABLE contents ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Copy views to view_count
UPDATE contents SET view_count = views WHERE view_count = 0;

-- Update price_type constraint to include 'member_only'
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_price_type_check;
ALTER TABLE contents ADD CONSTRAINT contents_price_type_check
  CHECK (price_type IN ('free', 'member', 'member_only'));

-- Update existing 'member' to 'member_only' for consistency
UPDATE contents SET price_type = 'member_only' WHERE price_type = 'member';

