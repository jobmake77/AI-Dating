-- 创建 API 性能指标表
CREATE TABLE IF NOT EXISTS api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  duration NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_api_metrics_timestamp ON api_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_metrics_duration ON api_metrics(duration DESC);
CREATE INDEX IF NOT EXISTS idx_api_metrics_status ON api_metrics(status_code);

-- 添加注释
COMMENT ON TABLE api_metrics IS 'API 性能指标表';
COMMENT ON COLUMN api_metrics.endpoint IS 'API 端点路径';
COMMENT ON COLUMN api_metrics.method IS 'HTTP 方法';
COMMENT ON COLUMN api_metrics.status_code IS 'HTTP 状态码';
COMMENT ON COLUMN api_metrics.duration IS '响应时间（毫秒）';
COMMENT ON COLUMN api_metrics.user_agent IS '用户代理';
COMMENT ON COLUMN api_metrics.ip IS '客户端 IP';

-- 创建自动清理旧数据的函数
CREATE OR REPLACE FUNCTION cleanup_old_api_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM api_metrics
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（需要 pg_cron 扩展）
-- SELECT cron.schedule('cleanup-api-metrics', '0 3 * * *', 'SELECT cleanup_old_api_metrics()');
