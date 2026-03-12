-- Migration: Add Follower Counts to Users Table
-- Description: Add followers_count and following_count fields with triggers to maintain them
-- Date: 2026-03-09

-- Add followers_count and following_count columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0 NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_followers_count ON users(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_users_following_count ON users(following_count DESC);

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the followed user
    UPDATE users
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;

    -- Increment following count for the follower
    UPDATE users
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for the followed user
    UPDATE users
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.following_id;

    -- Decrement following count for the follower
    UPDATE users
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.follower_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on follows table
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- Initialize counts for existing users
UPDATE users u
SET
  followers_count = (
    SELECT COUNT(*)
    FROM follows f
    WHERE f.following_id = u.id
  ),
  following_count = (
    SELECT COUNT(*)
    FROM follows f
    WHERE f.follower_id = u.id
  );

-- Add comments
COMMENT ON COLUMN users.followers_count IS 'Number of users following this user';
COMMENT ON COLUMN users.following_count IS 'Number of users this user is following';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Follower counts added to users table';
  RAISE NOTICE '🔄 Triggers created to maintain counts automatically';
  RAISE NOTICE '📊 Existing user counts initialized';
END $$;
