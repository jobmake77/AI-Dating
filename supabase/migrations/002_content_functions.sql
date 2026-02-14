-- Day 2: Content Management Functions

-- Function to increment view count
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;
