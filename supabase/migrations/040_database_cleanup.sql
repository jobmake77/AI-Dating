-- Migration: Database Cleanup and Optimization
-- Description: Remove redundant fields, add missing indexes
-- Date: 2026-03-09

-- Remove redundant fields from contents table
-- Keep view_count, remove views
ALTER TABLE contents DROP COLUMN IF EXISTS views;

-- Remove redundant fields from users table
-- Keep membership_tier, remove is_member
ALTER TABLE users DROP COLUMN IF EXISTS is_member;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_agents_last_used_at ON user_agents(last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category_created ON analytics_events(event_category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_deleted_at ON contents(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add comments
COMMENT ON INDEX idx_user_agents_last_used_at IS 'For cleanup queries on user agents';
COMMENT ON INDEX idx_analytics_events_category_created IS 'Composite index for analytics queries';
COMMENT ON INDEX idx_contents_deleted_at IS 'Partial index for soft-deleted content';
COMMENT ON INDEX idx_comments_deleted_at IS 'Partial index for soft-deleted comments';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Redundant fields removed';
  RAISE NOTICE '📊 Performance indexes added';
  RAISE NOTICE '🗑️ Soft delete indexes created';
END $$;
