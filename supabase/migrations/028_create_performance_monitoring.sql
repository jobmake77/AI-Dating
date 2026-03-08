-- 创建 Web Vitals 表
CREATE TABLE IF NOT EXISTS web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT NOT NULL CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  metric_delta NUMERIC NOT NULL,
  metric_id TEXT NOT NULL,
  navigation_type TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_web_vitals_user_id ON web_vitals(user_id);
CREATE INDEX idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX idx_web_vitals_created_at ON web_vitals(created_at DESC);
CREATE INDEX idx_web_vitals_rating ON web_vitals(metric_rating);

-- 创建性能指标表
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  -- 导航时间
  dns_time INTEGER,
  tcp_time INTEGER,
  request_time INTEGER,
  response_time INTEGER,
  dom_processing_time INTEGER,
  dom_content_loaded_time INTEGER,
  load_complete_time INTEGER,
  ttfb INTEGER,
  -- 资源加载
  resource_count INTEGER,
  total_resource_size BIGINT,
  total_resource_duration INTEGER,
  resources_by_type JSONB,
  -- 内存使用
  memory_used BIGINT,
  memory_total BIGINT,
  memory_limit BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_page_url ON performance_metrics(page_url);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_ttfb ON performance_metrics(ttfb);

-- 启用 RLS
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许插入（匿名和认证用户）
CREATE POLICY "Allow insert web_vitals" ON web_vitals
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow insert performance_metrics" ON performance_metrics
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS 策略：只有管理员可以查看
CREATE POLICY "Admin can view web_vitals" ON web_vitals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can view performance_metrics" ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 添加注释
COMMENT ON TABLE web_vitals IS 'Core Web Vitals 性能指标';
COMMENT ON TABLE performance_metrics IS '页面性能指标';
