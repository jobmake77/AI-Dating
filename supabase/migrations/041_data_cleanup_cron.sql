-- Migration: Data Cleanup Cron Jobs
-- Description: Schedule automatic cleanup of old data
-- Date: 2026-03-09
-- Note: Requires pg_cron extension

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup of old analytics events (runs daily at 2 AM)
SELECT cron.schedule(
  'cleanup-analytics-events',
  '0 2 * * *',
  $$DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Schedule cleanup of old read notifications (runs daily at 3 AM)
SELECT cron.schedule(
  'cleanup-read-notifications',
  '0 3 * * *',
  $$DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days'$$
);

-- Schedule cleanup of old performance metrics (runs daily at 4 AM)
SELECT cron.schedule(
  'cleanup-performance-metrics',
  '0 4 * * *',
  $$DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Schedule cleanup of old web vitals (runs daily at 4:30 AM)
SELECT cron.schedule(
  'cleanup-web-vitals',
  '30 4 * * *',
  $$DELETE FROM web_vitals WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Add comments
COMMENT ON EXTENSION pg_cron IS 'PostgreSQL job scheduler for periodic tasks';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Data cleanup cron jobs scheduled';
  RAISE NOTICE '🗑️ Analytics events: 90 days retention';
  RAISE NOTICE '🗑️ Read notifications: 30 days retention';
  RAISE NOTICE '🗑️ Performance metrics: 90 days retention';
  RAISE NOTICE '⏰ Jobs run daily at 2-4 AM';
END $$;
