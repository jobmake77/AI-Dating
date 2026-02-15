-- ============================================
-- 创建转发表
-- 执行日期: 2026-02-16
-- ============================================

-- 创建转发表
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 确保用户只能转发同一内容一次
  UNIQUE(content_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reposts_content_id ON reposts(content_id);
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created_at ON reposts(created_at DESC);

-- 启用 RLS
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有人可以查看转发
CREATE POLICY "Reposts are viewable by everyone"
  ON reposts FOR SELECT
  USING (true);

-- 登录用户可以转发
CREATE POLICY "Authenticated users can create reposts"
  ON reposts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以取消自己的转发
CREATE POLICY "Users can delete own reposts"
  ON reposts FOR DELETE
  USING (auth.uid() = user_id);

-- 添加转发数字段到 contents 表
ALTER TABLE contents ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;

-- 创建函数：更新转发数
CREATE OR REPLACE FUNCTION update_reposts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contents
    SET reposts_count = reposts_count + 1
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contents
    SET reposts_count = reposts_count - 1
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_reposts_count_trigger ON reposts;
CREATE TRIGGER update_reposts_count_trigger
  AFTER INSERT OR DELETE ON reposts
  FOR EACH ROW
  EXECUTE FUNCTION update_reposts_count();
