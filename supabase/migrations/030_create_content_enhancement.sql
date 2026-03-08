-- Create content_versions table for version history
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  tags TEXT[],
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, version_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at DESC);

-- Create drafts table for auto-save functionality
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  price_type TEXT DEFAULT 'free' CHECK (price_type IN ('free', 'member')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Only one draft per user
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_drafts_user_id ON content_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_drafts_updated_at ON content_drafts(updated_at DESC);

-- Create reading_history table for recommendation system
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  read_duration INTEGER DEFAULT 0, -- in seconds
  read_percentage INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_content_id ON reading_history(content_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_updated_at ON reading_history(updated_at DESC);

-- RLS Policies for content_versions
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Anyone can view version history of published content
CREATE POLICY "Anyone can view version history"
  ON content_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contents
      WHERE contents.id = content_versions.content_id
      AND contents.status = 'approved'
    )
  );

-- Only content author can create versions
CREATE POLICY "Authors can create versions"
  ON content_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contents
      WHERE contents.id = content_versions.content_id
      AND contents.author_id = auth.uid()
    )
  );

-- RLS Policies for content_drafts
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own drafts
CREATE POLICY "Users can view own drafts"
  ON content_drafts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own drafts
CREATE POLICY "Users can insert own drafts"
  ON content_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update own drafts"
  ON content_drafts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete own drafts"
  ON content_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reading_history
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own reading history
CREATE POLICY "Users can view own reading history"
  ON reading_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reading history
CREATE POLICY "Users can insert own reading history"
  ON reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reading history
CREATE POLICY "Users can update own reading history"
  ON reading_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically create version on content update
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content OR
     OLD.title IS DISTINCT FROM NEW.title THEN

    INSERT INTO content_versions (
      content_id,
      version_number,
      title,
      content,
      excerpt,
      cover_image,
      tags,
      created_by
    )
    SELECT
      NEW.id,
      COALESCE((
        SELECT MAX(version_number) + 1
        FROM content_versions
        WHERE content_id = NEW.id
      ), 1),
      NEW.title,
      NEW.content,
      NEW.excerpt,
      NEW.cover_image,
      NEW.tags,
      NEW.author_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create versions
DROP TRIGGER IF EXISTS trigger_create_content_version ON contents;
CREATE TRIGGER trigger_create_content_version
  AFTER UPDATE ON contents
  FOR EACH ROW
  EXECUTE FUNCTION create_content_version();

-- Function to update draft timestamp
CREATE OR REPLACE FUNCTION update_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update draft timestamp
DROP TRIGGER IF EXISTS trigger_update_draft_timestamp ON content_drafts;
CREATE TRIGGER trigger_update_draft_timestamp
  BEFORE UPDATE ON content_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_timestamp();
