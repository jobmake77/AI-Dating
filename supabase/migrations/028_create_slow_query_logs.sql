-- 创建慢查询日志表
CREATE TABLE IF NOT EXISTS slow_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  params JSONB,
  stack_trace TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_slow_query_logs_timestamp ON slow_query_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_slow_query_logs_table ON slow_query_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_slow_query_logs_duration ON slow_query_logs(duration DESC);

-- 添加注释
COMMENT ON TABLE slow_query_logs IS '慢查询日志表';
COMMENT ON COLUMN slow_query_logs.query IS '查询名称或描述';
COMMENT ON COLUMN slow_query_logs.duration IS '查询执行时间（毫秒）';
COMMENT ON COLUMN slow_query_logs.table_name IS '查询的表名';
COMMENT ON COLUMN slow_query_logs.operation IS '操作类型（select/insert/update/delete）';
COMMENT ON COLUMN slow_query_logs.params IS '查询参数';
COMMENT ON COLUMN slow_query_logs.stack_trace IS '堆栈跟踪';

-- 创建自动清理旧日志的函数
CREATE OR REPLACE FUNCTION cleanup_old_slow_query_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM slow_query_logs
  WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（需要 pg_cron 扩展）
-- SELECT cron.schedule('cleanup-slow-query-logs', '0 2 * * *', 'SELECT cleanup_old_slow_query_logs()');
