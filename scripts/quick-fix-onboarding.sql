-- 快速创建 user_onboarding 表
-- 复制整个脚本到 Supabase SQL Editor 并运行

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

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding"
  ON user_onboarding
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

INSERT INTO user_onboarding (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Success! Created ' || COUNT(*) || ' onboarding records' as result
FROM user_onboarding;
