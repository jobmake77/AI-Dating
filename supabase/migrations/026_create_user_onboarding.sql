-- 用户引导进度表
-- 创建日期: 2026-03-07
-- 用途: 追踪新用户引导流程的完成进度

CREATE TABLE IF NOT EXISTS user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  completed_profile BOOLEAN DEFAULT false,
  first_post_published BOOLEAN DEFAULT false,
  explored_content BOOLEAN DEFAULT false,
  checked_membership BOOLEAN DEFAULT false,
  tour_completed BOOLEAN DEFAULT false,
  tour_skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的引导进度
CREATE POLICY "Users can view own onboarding progress" ON user_onboarding
  FOR SELECT USING (auth.uid() = user_id);

-- RLS 策略：用户只能更新自己的引导进度
CREATE POLICY "Users can update own onboarding progress" ON user_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS 策略：用户可以插入自己的引导进度
CREATE POLICY "Users can insert own onboarding progress" ON user_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(tour_completed);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_skipped ON user_onboarding(tour_skipped);

-- 更新时间触发器
CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 自动为新用户创建引导记录的触发器
CREATE OR REPLACE FUNCTION create_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_onboarding (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_onboarding();

-- 为现有用户创建引导记录
INSERT INTO user_onboarding (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
