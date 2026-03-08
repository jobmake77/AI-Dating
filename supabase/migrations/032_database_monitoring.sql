-- =====================================================
-- 数据库监控和性能追踪
-- 创建时间: 2026-03-08
-- 描述: 创建数据库性能监控工具和慢查询追踪
-- =====================================================

-- =====================================================
-- 1. 创建查询性能日志表
-- =====================================================

CREATE TABLE IF NOT EXISTS query_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name TEXT NOT NULL,
  query_text TEXT,
  execution_time_ms NUMERIC NOT NULL,
  rows_returned INTEGER,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_query_performance_logs_created
ON query_performance_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_logs_query_name
ON query_performance_logs(query_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_logs_slow
ON query_performance_logs(execution_time_ms DESC) WHERE execution_time_ms > 1000;

-- =====================================================
-- 2. 创建数据库统计视图
-- =====================================================

-- 表大小统计
CREATE OR REPLACE VIEW table_sizes AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  pg_total_relation_size(schemaname||'.'||tablename) AS total_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 索引使用统计
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- 未使用的索引
CREATE OR REPLACE VIEW unused_indexes AS
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint WHERE contype IN ('p', 'u')
  )
ORDER BY pg_relation_size(indexrelid) DESC;

-- 表统计信息
CREATE OR REPLACE VIEW table_stats AS
SELECT
  schemaname,
  tablename,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_row_percent,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- =====================================================
-- 3. 创建慢查询分析函数
-- =====================================================

-- 记录查询性能
CREATE OR REPLACE FUNCTION log_query_performance(
  p_query_name TEXT,
  p_query_text TEXT,
  p_execution_time_ms NUMERIC,
  p_rows_returned INTEGER DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO query_performance_logs (
    query_name,
    query_text,
    execution_time_ms,
    rows_returned,
    user_id
  )
  VALUES (
    p_query_name,
    p_query_text,
    p_execution_time_ms,
    p_rows_returned,
    p_user_id
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取慢查询统计
CREATE OR REPLACE FUNCTION get_slow_queries(
  p_threshold_ms NUMERIC DEFAULT 1000,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  query_name TEXT,
  avg_execution_time_ms NUMERIC,
  max_execution_time_ms NUMERIC,
  min_execution_time_ms NUMERIC,
  total_executions BIGINT,
  last_execution TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qpl.query_name,
    ROUND(AVG(qpl.execution_time_ms), 2) AS avg_execution_time_ms,
    MAX(qpl.execution_time_ms) AS max_execution_time_ms,
    MIN(qpl.execution_time_ms) AS min_execution_time_ms,
    COUNT(*) AS total_executions,
    MAX(qpl.created_at) AS last_execution
  FROM query_performance_logs qpl
  WHERE qpl.execution_time_ms > p_threshold_ms
  GROUP BY qpl.query_name
  ORDER BY avg_execution_time_ms DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. 创建连接池监控函数
-- =====================================================

-- 获取当前连接统计
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE(
  total_connections INTEGER,
  active_connections INTEGER,
  idle_connections INTEGER,
  idle_in_transaction INTEGER,
  max_connections INTEGER,
  connection_usage_percent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_connections,
    COUNT(*) FILTER (WHERE state = 'active')::INTEGER AS active_connections,
    COUNT(*) FILTER (WHERE state = 'idle')::INTEGER AS idle_connections,
    COUNT(*) FILTER (WHERE state = 'idle in transaction')::INTEGER AS idle_in_transaction,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    ROUND(100.0 * COUNT(*) / (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections'), 2) AS connection_usage_percent
  FROM pg_stat_activity
  WHERE datname = current_database();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. 创建数据库健康检查函数
-- =====================================================

CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT,
  severity TEXT
) AS $$
BEGIN
  -- 检查表膨胀
  RETURN QUERY
  SELECT
    'Table Bloat'::TEXT AS check_name,
    CASE
      WHEN MAX(ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)) > 20 THEN 'WARNING'
      WHEN MAX(ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)) > 10 THEN 'INFO'
      ELSE 'OK'
    END AS status,
    'Max dead row percentage: ' || COALESCE(MAX(ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2))::TEXT, '0') || '%' AS details,
    CASE
      WHEN MAX(ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)) > 20 THEN 'HIGH'
      WHEN MAX(ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)) > 10 THEN 'MEDIUM'
      ELSE 'LOW'
    END AS severity
  FROM pg_stat_user_tables;

  -- 检查未使用的索引
  RETURN QUERY
  SELECT
    'Unused Indexes'::TEXT AS check_name,
    CASE
      WHEN COUNT(*) > 10 THEN 'WARNING'
      WHEN COUNT(*) > 5 THEN 'INFO'
      ELSE 'OK'
    END AS status,
    'Found ' || COUNT(*)::TEXT || ' unused indexes' AS details,
    CASE
      WHEN COUNT(*) > 10 THEN 'MEDIUM'
      WHEN COUNT(*) > 5 THEN 'LOW'
      ELSE 'LOW'
    END AS severity
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
    AND indexrelid NOT IN (
      SELECT conindid FROM pg_constraint WHERE contype IN ('p', 'u')
    );

  -- 检查连接数
  RETURN QUERY
  SELECT
    'Connection Usage'::TEXT AS check_name,
    CASE
      WHEN connection_usage_percent > 80 THEN 'WARNING'
      WHEN connection_usage_percent > 60 THEN 'INFO'
      ELSE 'OK'
    END AS status,
    'Connection usage: ' || connection_usage_percent::TEXT || '%' AS details,
    CASE
      WHEN connection_usage_percent > 80 THEN 'HIGH'
      WHEN connection_usage_percent > 60 THEN 'MEDIUM'
      ELSE 'LOW'
    END AS severity
  FROM get_connection_stats();

  -- 检查慢查询
  RETURN QUERY
  SELECT
    'Slow Queries'::TEXT AS check_name,
    CASE
      WHEN COUNT(*) > 100 THEN 'WARNING'
      WHEN COUNT(*) > 50 THEN 'INFO'
      ELSE 'OK'
    END AS status,
    'Found ' || COUNT(*)::TEXT || ' slow queries (>1s) in last 24h' AS details,
    CASE
      WHEN COUNT(*) > 100 THEN 'HIGH'
      WHEN COUNT(*) > 50 THEN 'MEDIUM'
      ELSE 'LOW'
    END AS severity
  FROM query_performance_logs
  WHERE execution_time_ms > 1000
    AND created_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. 创建自动维护建议函数
-- =====================================================

CREATE OR REPLACE FUNCTION get_maintenance_recommendations()
RETURNS TABLE(
  recommendation_type TEXT,
  table_name TEXT,
  reason TEXT,
  suggested_action TEXT,
  priority TEXT
) AS $$
BEGIN
  -- 需要 VACUUM 的表
  RETURN QUERY
  SELECT
    'VACUUM'::TEXT AS recommendation_type,
    tablename::TEXT,
    'Dead row percentage: ' || ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2)::TEXT || '%' AS reason,
    'Run VACUUM ANALYZE ' || tablename AS suggested_action,
    CASE
      WHEN ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) > 20 THEN 'HIGH'
      WHEN ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) > 10 THEN 'MEDIUM'
      ELSE 'LOW'
    END AS priority
  FROM pg_stat_user_tables
  WHERE ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) > 10
  ORDER BY n_dead_tup DESC;

  -- 需要删除的未使用索引
  RETURN QUERY
  SELECT
    'DROP INDEX'::TEXT AS recommendation_type,
    tablename::TEXT,
    'Index ' || indexname || ' has never been used' AS reason,
    'DROP INDEX IF EXISTS ' || indexname AS suggested_action,
    'LOW'::TEXT AS priority
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
    AND indexrelid NOT IN (
      SELECT conindid FROM pg_constraint WHERE contype IN ('p', 'u')
    )
  ORDER BY pg_relation_size(indexrelid) DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. 启用监控表 RLS
-- =====================================================

ALTER TABLE query_performance_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看性能日志
CREATE POLICY "Only admins can view query performance logs"
ON query_performance_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 所有认证用户可以记录查询性能
CREATE POLICY "Authenticated users can log query performance"
ON query_performance_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
