-- ============================================
-- 创建点赞表
-- 执行日期: 2026-02-15
-- ============================================

-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 确保用户只能对同一内容点赞一次
  UNIQUE(content_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_likes_content_id ON likes(content_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- 启用 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有人可以查看点赞
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

-- 登录用户可以点赞
CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以取消自己的点赞
CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- 创建函数：更新点赞数
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contents
    SET likes_count = likes_count + 1
    WHERE id = NEW.content_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contents
    SET likes_count = likes_count - 1
    WHERE id = OLD.content_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_likes_count_trigger ON likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_likes_count();
