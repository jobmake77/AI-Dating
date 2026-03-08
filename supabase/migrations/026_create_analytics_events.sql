-- ============================================
-- Analytics Events 表
-- 用于存储用户行为事件日志
-- 创建日期: 2026-03-07
-- ============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 事件基本信息
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('user', 'content', 'membership', 'api', 'community', 'onboarding')),

  -- 用户信息
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,

  -- 事件参数（JSONB 格式，灵活存储）
  event_params JSONB DEFAULT '{}'::jsonb,

  -- 元数据
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  page_url TEXT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- 为 JSONB 字段创建 GIN 索引以支持高效查询
CREATE INDEX idx_analytics_events_params ON analytics_events USING GIN (event_params);

-- 启用 RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS 策略：只有管理员可以查看所有事件
CREATE POLICY "analytics_events_select_admin" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS 策略：认证用户可以插入事件（通过 service role）
CREATE POLICY "analytics_events_insert_authenticated" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- 创建函数：清理旧事件（保留 90 天）
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- 注释
COMMENT ON TABLE analytics_events IS '用户行为事件日志表，用于分析和追踪';
COMMENT ON COLUMN analytics_events.event_name IS '事件名称，如 user_signed_up, post_published';
COMMENT ON COLUMN analytics_events.event_category IS '事件分类：user, content, membership, api, community, onboarding';
COMMENT ON COLUMN analytics_events.event_params IS '事件参数，JSONB 格式，灵活存储各种事件数据';
COMMENT ON COLUMN analytics_events.session_id IS '会话 ID，用于追踪用户会话';

-- 完成消息
DO $$
BEGIN
  RAISE NOTICE '✅ Analytics Events 表创建完成！';
  RAISE NOTICE '📊 事件日志将保留 90 天';
  RAISE NOTICE '🔒 RLS 策略已启用，只有管理员可查看';
END $$;
