-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建内容标签关联表
CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, tag_id)
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_content_tags_content_id ON content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag_id ON content_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 移除 contents 表的 category 字段（如果存在）
ALTER TABLE contents DROP COLUMN IF EXISTS category;

-- 添加触发器：自动更新标签使用次数
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_count
AFTER INSERT OR DELETE ON content_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- RLS 策略：标签表
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看标签
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

-- 认证用户可以创建标签
CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS 策略：内容标签关联表
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看内容标签关联
CREATE POLICY "Anyone can view content tags"
  ON content_tags FOR SELECT
  USING (true);

-- 内容作者可以管理自己内容的标签
CREATE POLICY "Content authors can manage their content tags"
  ON content_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM contents
      WHERE contents.id = content_tags.content_id
      AND contents.author_id = auth.uid()
    )
  );

-- 添加一些初始热门标签（可选）
INSERT INTO tags (name, slug, description) VALUES
  ('Next.js', 'nextjs', 'Next.js 框架相关内容'),
  ('React', 'react', 'React 库相关内容'),
  ('TypeScript', 'typescript', 'TypeScript 语言相关内容'),
  ('AI', 'ai', '人工智能相关内容'),
  ('前端开发', 'frontend', '前端开发相关内容'),
  ('后端开发', 'backend', '后端开发相关内容'),
  ('数据库', 'database', '数据库相关内容'),
  ('架构设计', 'architecture', '系统架构设计相关内容'),
  ('性能优化', 'performance', '性能优化相关内容'),
  ('最佳实践', 'best-practices', '最佳实践和经验分享')
ON CONFLICT (name) DO NOTHING;
