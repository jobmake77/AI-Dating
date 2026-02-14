-- Day 2 Refactor: Remove category requirement, make tags-driven

-- Make category nullable (for backward compatibility)
ALTER TABLE contents ALTER COLUMN category DROP NOT NULL;

-- Add index on tags for better query performance
CREATE INDEX IF NOT EXISTS idx_contents_tags ON contents USING GIN (tags);

-- Update increment_view_count function (keep existing)
CREATE OR REPLACE FUNCTION increment_view_count(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contents
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;
