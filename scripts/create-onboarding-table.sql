-- 创建 user_onboarding 表
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 创建表
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

-- 2. 启用 Row Level Security
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- 3. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own onboarding progress" ON user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding progress" ON user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding progress" ON user_onboarding;

-- 4. 创建 RLS 策略
CREATE POLICY "Users can view own onboarding progress" ON user_onboarding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON user_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" ON user_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(tour_completed);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_skipped ON user_onboarding(tour_skipped);

-- 6. 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 创建触发器
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON user_onboarding;
CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 创建自动为新用户创建引导记录的触发器函数
CREATE OR REPLACE FUNCTION create_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_onboarding (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建触发器（在 users 表上）
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_onboarding();

-- 10. 为现有用户创建引导记录
INSERT INTO user_onboarding (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- 11. 验证表已创建
SELECT 'Table created successfully!' as status,
       COUNT(*) as total_records
FROM user_onboarding;
