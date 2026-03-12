-- Migration: Add Privacy Features (Fixed)
-- Description: Add tables for privacy settings, data export requests, and account deletion requests
-- Date: 2026-03-08
-- Fixed: Changed profiles references to users

-- Create user_privacy_settings table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'followers_only')),
  show_email BOOLEAN NOT NULL DEFAULT false,
  show_location BOOLEAN NOT NULL DEFAULT false,
  allow_messages BOOLEAN NOT NULL DEFAULT true,
  allow_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add deleted_at column to users table (soft delete)
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to contents table (soft delete)
ALTER TABLE contents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add deleted_at column to comments table (soft delete)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_contents_deleted_at ON contents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Create function to update updated_at timestamp (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_privacy_settings
DROP TRIGGER IF EXISTS update_user_privacy_settings_updated_at ON user_privacy_settings;
CREATE TRIGGER update_user_privacy_settings_updated_at
  BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_privacy_settings
CREATE POLICY "Users can view their own privacy settings"
  ON user_privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings"
  ON user_privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
  ON user_privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS policies for data_export_requests
CREATE POLICY "Users can view their own export requests"
  ON data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
  ON data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for account_deletion_requests
CREATE POLICY "Users can view their own deletion requests"
  ON account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests"
  ON account_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin policies (using users table instead of profiles)
CREATE POLICY "Admins can view all export requests"
  ON data_export_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all deletion requests"
  ON account_deletion_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create view for active users (excluding deleted)
CREATE OR REPLACE VIEW active_users AS
SELECT *
FROM users
WHERE deleted_at IS NULL;

-- Create view for active contents (excluding deleted)
CREATE OR REPLACE VIEW active_contents AS
SELECT *
FROM contents
WHERE deleted_at IS NULL;

-- Create view for active comments (excluding deleted)
CREATE OR REPLACE VIEW active_comments AS
SELECT *
FROM comments
WHERE deleted_at IS NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_privacy_settings TO authenticated;
GRANT SELECT, INSERT ON data_export_requests TO authenticated;
GRANT SELECT, INSERT ON account_deletion_requests TO authenticated;
GRANT SELECT ON active_users TO authenticated;
GRANT SELECT ON active_contents TO authenticated;
GRANT SELECT ON active_comments TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_privacy_settings IS 'Stores user privacy preferences and settings';
COMMENT ON TABLE data_export_requests IS 'Tracks user data export requests for GDPR compliance';
COMMENT ON TABLE account_deletion_requests IS 'Tracks account deletion requests for GDPR compliance';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when the account was soft deleted';
COMMENT ON COLUMN contents.deleted_at IS 'Timestamp when the content was soft deleted';
COMMENT ON COLUMN comments.deleted_at IS 'Timestamp when the comment was soft deleted';
