-- ============================================
-- 创建关注表
-- 执行日期: 2026-02-16
-- ============================================

-- 创建关注表
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 确保不能重复关注，也不能关注自己
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- 启用 RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS 策略
-- 所有人可以查看关注关系
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

-- 登录用户可以关注他人
CREATE POLICY "Authenticated users can create follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- 用户可以取消自己的关注
CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 添加关注数字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 创建函数：更新关注数
CREATE OR REPLACE FUNCTION update_follows_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 增加被关注者的粉丝数
    UPDATE users
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
    -- 增加关注者的关注数
    UPDATE users
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 减少被关注者的粉丝数
    UPDATE users
    SET followers_count = followers_count - 1
    WHERE id = OLD.following_id;
    -- 减少关注者的关注数
    UPDATE users
    SET following_count = following_count - 1
    WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_follows_count_trigger ON follows;
CREATE TRIGGER update_follows_count_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follows_count();
