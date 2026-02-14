-- ============================================
-- AI-Dating 数据库完整重构
-- 执行日期: 2026-02-14
-- 说明: 完全重构数据库以修复认证和 RLS 问题
-- ============================================

-- ============================================
-- 第一步: 清理现有表和策略
-- ============================================

-- 禁用 RLS 以便清理
ALTER TABLE IF EXISTS contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS moderation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions DISABLE ROW LEVEL SECURITY;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Approved contents are viewable by everyone" ON contents;
DROP POLICY IF EXISTS "Creators can view own contents" ON contents;
DROP POLICY IF EXISTS "Creators can create contents" ON contents;
DROP POLICY IF EXISTS "Creators can update own contents" ON contents;
DROP POLICY IF EXISTS "Creators can delete own contents" ON contents;
DROP POLICY IF EXISTS "Admins can view all contents" ON contents;
DROP POLICY IF EXISTS "Admins can update all contents" ON contents;
DROP POLICY IF EXISTS "Only admins can view moderation logs" ON moderation_logs;
DROP POLICY IF EXISTS "Only admins can create moderation logs" ON moderation_logs;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can create subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON subscriptions;

-- 删除依赖表（保持顺序）
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 第二步: 重新创建用户表（正确配置）
-- ============================================

CREATE TABLE users (
  -- 使用 Supabase Auth 的 UUID，不自动生成
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar TEXT,
  bio TEXT,

  -- GitHub 信息
  github_username TEXT,
  github_url TEXT,

  -- 角色和会员
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium')),
  member_expire_at TIMESTAMP WITH TIME ZONE,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 第三步: 重新创建内容表
-- ============================================

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 内容信息
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,

  -- 分类和标签（category 可选，tags 为主）
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- 定价和状态
  price_type TEXT DEFAULT 'free' CHECK (price_type IN ('free', 'member_only')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,

  -- 统计数据
  views INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 第四步: 重新创建审核和订阅表
-- ============================================

CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 第五步: 创建索引
-- ============================================

-- Users 索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Contents 索引
CREATE INDEX idx_contents_author_id ON contents(author_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX idx_contents_tags ON contents USING GIN (tags);
CREATE INDEX idx_contents_slug ON contents(slug);

-- Subscriptions 索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 第六步: 创建触发器
-- ============================================

-- 更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 浏览量增加函数
CREATE OR REPLACE FUNCTION increment_view_count(content_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE contents
  SET
    view_count = view_count + 1,
    views = views + 1
  WHERE id = content_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;

-- ============================================
-- 第七步: 启用 RLS 并创建策略
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Users 表 RLS 策略
-- ============================================

-- 所有人可以查看用户信息
CREATE POLICY "users_select_all" ON users
  FOR SELECT
  USING (true);

-- 用户可以插入自己的记录（认证回调需要）
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 用户可以更新自己的信息
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Contents 表 RLS 策略
-- ============================================

-- 所有人可以查看已批准的内容
CREATE POLICY "contents_select_approved" ON contents
  FOR SELECT
  USING (status = 'approved');

-- 作者可以查看自己的所有内容
CREATE POLICY "contents_select_own" ON contents
  FOR SELECT
  USING (auth.uid() = author_id);

-- 管理员可以查看所有内容
CREATE POLICY "contents_select_admin" ON contents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 认证用户可以创建内容
CREATE POLICY "contents_insert_authenticated" ON contents
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 作者可以更新自己的内容
CREATE POLICY "contents_update_own" ON contents
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- 管理员可以更新所有内容
CREATE POLICY "contents_update_admin" ON contents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 作者可以删除自己的内容
CREATE POLICY "contents_delete_own" ON contents
  FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- Moderation Logs 表 RLS 策略
-- ============================================

-- 只有管理员可以查看审核记录
CREATE POLICY "moderation_logs_select_admin" ON moderation_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 只有管理员可以创建审核记录
CREATE POLICY "moderation_logs_insert_admin" ON moderation_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- Subscriptions 表 RLS 策略
-- ============================================

-- 用户可以查看自己的订阅
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 管理员可以查看所有订阅
CREATE POLICY "subscriptions_select_admin" ON subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 管理员可以创建订阅
CREATE POLICY "subscriptions_insert_admin" ON subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 管理员可以更新订阅
CREATE POLICY "subscriptions_update_admin" ON subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 验证和完成
-- ============================================

-- 显示表结构
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'contents', 'moderation_logs', 'subscriptions')
ORDER BY table_name, ordinal_position;

-- 显示 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 完成消息
DO $$
BEGIN
  RAISE NOTICE '✅ 数据库重构完成！';
  RAISE NOTICE '📝 Users 表已正确配置为使用 Supabase Auth UUID';
  RAISE NOTICE '🔒 所有 RLS 策略已重新创建';
  RAISE NOTICE '🧪 请测试登录功能';
END $$;
