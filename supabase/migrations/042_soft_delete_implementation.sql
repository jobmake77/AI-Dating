-- Migration: Soft Delete Implementation
-- Description: Add soft delete support with RLS policies and helper functions
-- Date: 2026-03-09

-- =====================================================
-- 1. Helper Functions for Soft Delete
-- =====================================================

-- Function to soft delete a content
CREATE OR REPLACE FUNCTION soft_delete_content(content_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE contents
  SET deleted_at = NOW()
  WHERE id = content_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete a comment
CREATE OR REPLACE FUNCTION soft_delete_comment(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET deleted_at = NOW()
  WHERE id = comment_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted content
CREATE OR REPLACE FUNCTION restore_content(content_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE contents
  SET deleted_at = NULL
  WHERE id = content_id AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a soft-deleted comment
CREATE OR REPLACE FUNCTION restore_comment(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET deleted_at = NULL
  WHERE id = comment_id AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Update RLS Policies to Exclude Soft-Deleted Records
-- =====================================================

-- Drop existing policies for contents
DROP POLICY IF EXISTS "Contents are viewable by everyone" ON contents;
DROP POLICY IF EXISTS "Users can insert their own contents" ON contents;
DROP POLICY IF EXISTS "Users can update their own contents" ON contents;
DROP POLICY IF EXISTS "Users can delete their own contents" ON contents;

-- Create new policies that exclude soft-deleted records
CREATE POLICY "Contents are viewable by everyone (excluding deleted)"
  ON contents FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Users can insert their own contents"
  ON contents FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own contents (excluding deleted)"
  ON contents FOR UPDATE
  USING (auth.uid() = author_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can soft delete their own contents"
  ON contents FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Drop existing policies for comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Create new policies that exclude soft-deleted records
CREATE POLICY "Comments are viewable by everyone (excluding deleted)"
  ON comments FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Users can insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments (excluding deleted)"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. Create Views for Active Records
-- =====================================================

-- View for active contents (excluding soft-deleted)
CREATE OR REPLACE VIEW active_contents AS
SELECT * FROM contents
WHERE deleted_at IS NULL;

-- View for active comments (excluding soft-deleted)
CREATE OR REPLACE VIEW active_comments AS
SELECT * FROM comments
WHERE deleted_at IS NULL;

-- =====================================================
-- 4. Add Comments
-- =====================================================

COMMENT ON FUNCTION soft_delete_content IS 'Soft delete a content by setting deleted_at timestamp';
COMMENT ON FUNCTION soft_delete_comment IS 'Soft delete a comment by setting deleted_at timestamp';
COMMENT ON FUNCTION restore_content IS 'Restore a soft-deleted content by clearing deleted_at';
COMMENT ON FUNCTION restore_comment IS 'Restore a soft-deleted comment by clearing deleted_at';
COMMENT ON VIEW active_contents IS 'View of all non-deleted contents';
COMMENT ON VIEW active_comments IS 'View of all non-deleted comments';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Soft delete functions created';
  RAISE NOTICE '🔒 RLS policies updated to exclude deleted records';
  RAISE NOTICE '👁️ Active record views created';
END $$;
