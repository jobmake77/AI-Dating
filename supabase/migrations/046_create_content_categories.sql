-- 内容分类配置表
-- 支持后台可配置分类，并为历史内容保留 category 字段

ALTER TABLE contents
  ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE contents
  ALTER COLUMN category DROP NOT NULL;

ALTER TABLE contents
  DROP CONSTRAINT IF EXISTS contents_category_check;

CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  required_role TEXT NOT NULL DEFAULT 'user' CHECK (required_role IN ('admin', 'user')),
  color TEXT NOT NULL DEFAULT '221 83% 53%',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_categories_active_sort
  ON content_categories(is_active, sort_order, created_at);

DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories;

CREATE TRIGGER update_content_categories_updated_at
  BEFORE UPDATE ON content_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO content_categories (name, slug, description, required_role, color, is_active, sort_order)
VALUES
  ('官方公告', 'announce', '平台官方发布的重要公告和通知', 'admin', '210 100% 56%', TRUE, 10),
  ('新手入门', 'beginner', '帮助新用户快速上手的指南和教程', 'admin', '152 69% 40%', TRUE, 20),
  ('官方活动', 'activity', '平台举办的各类活动信息', 'admin', '38 92% 50%', TRUE, 30),
  ('帮助与支持', 'help', '常见问题解答和技术支持', 'admin', '142 71% 45%', TRUE, 40),
  ('产品建议', 'suggest', '对平台功能和产品的改进建议', 'user', '262 83% 58%', TRUE, 50),
  ('技巧分享', 'tips', '分享使用技巧和经验心得', 'user', '199 89% 48%', TRUE, 60),
  ('案例与作品', 'showcase', '展示优秀作品和成功案例', 'user', '340 82% 52%', TRUE, 70),
  ('互动交流', 'chat', '用户之间的自由交流讨论', 'user', '24 95% 53%', TRUE, 80)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  required_role = EXCLUDED.required_role,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;
