-- ============================================
-- 数据库迁移验证脚本
-- ============================================
-- 用途: 验证所有迁移是否成功执行
-- 使用: psql $DATABASE_URL -f verify-migration.sql
-- ============================================

\echo '================================'
\echo '📊 数据库迁移验证报告'
\echo '================================'
\echo ''

-- 1. 检查核心表
\echo '1️⃣  检查核心表...'
SELECT
  CASE
    WHEN COUNT(*) >= 30 THEN '✅ 通过: 找到 ' || COUNT(*) || ' 个表'
    ELSE '❌ 失败: 只找到 ' || COUNT(*) || ' 个表 (预期 >= 30)'
  END AS result
FROM information_schema.tables
WHERE table_schema = 'public';

\echo ''
\echo '核心表列表:'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

\echo ''
\echo '================================'

-- 2. 检查触发器
\echo '2️⃣  检查触发器...'
SELECT
  CASE
    WHEN COUNT(*) >= 2 THEN '✅ 通过: 找到 ' || COUNT(*) || ' 个触发器'
    ELSE '❌ 失败: 只找到 ' || COUNT(*) || ' 个触发器'
  END AS result
FROM information_schema.triggers
WHERE trigger_schema = 'public';

\echo ''
\echo '触发器列表:'
SELECT
  trigger_name,
  event_object_table,
  action_timing || ' ' || string_agg(event_manipulation, ', ') AS events
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY trigger_name, event_object_table, action_timing
ORDER BY event_object_table, trigger_name;

\echo ''
\echo '================================'

-- 3. 检查外键约束
\echo '3️⃣  检查外键约束...'
SELECT
  CASE
    WHEN COUNT(*) >= 20 THEN '✅ 通过: 找到 ' || COUNT(*) || ' 个外键'
    ELSE '⚠️  警告: 只找到 ' || COUNT(*) || ' 个外键'
  END AS result
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

\echo ''
\echo '外键约束列表 (前 20 个):'
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name
LIMIT 20;

\echo ''
\echo '================================'

-- 4. 检查索引
\echo '4️⃣  检查索引...'
SELECT
  CASE
    WHEN COUNT(*) >= 30 THEN '✅ 通过: 找到 ' || COUNT(*) || ' 个索引'
    ELSE '⚠️  警告: 只找到 ' || COUNT(*) || ' 个索引'
  END AS result
FROM pg_indexes
WHERE schemaname = 'public';

\echo ''
\echo '自定义索引列表 (idx_ 开头):'
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

\echo ''
\echo '================================'

-- 5. 检查 Cron Jobs
\echo '5️⃣  检查 Cron Jobs...'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE '✅ pg_cron 扩展已启用';
  ELSE
    RAISE NOTICE '❌ pg_cron 扩展未启用';
  END IF;
END $$;

\echo ''
\echo 'Cron Jobs 列表:'
SELECT
  jobid,
  jobname,
  schedule,
  active
FROM cron.job
ORDER BY jobname;

\echo ''
\echo '================================'

-- 6. 检查 RLS 策略
\echo '6️⃣  检查 RLS 策略...'
SELECT
  CASE
    WHEN COUNT(*) >= 20 THEN '✅ 通过: 找到 ' || COUNT(*) || ' 个 RLS 策略'
    ELSE '⚠️  警告: 只找到 ' || COUNT(*) || ' 个 RLS 策略'
  END AS result
FROM pg_policies;

\echo ''
\echo 'RLS 策略统计 (按表):'
SELECT
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

\echo ''
\echo '================================'

-- 7. 检查软删除字段
\echo '7️⃣  检查软删除字段...'
SELECT
  CASE
    WHEN COUNT(*) >= 2 THEN '✅ 通过: ' || COUNT(*) || ' 个表有 deleted_at 字段'
    ELSE '❌ 失败: 只有 ' || COUNT(*) || ' 个表有 deleted_at 字段'
  END AS result
FROM information_schema.columns
WHERE column_name = 'deleted_at'
AND table_schema = 'public';

\echo ''
\echo '有 deleted_at 字段的表:'
SELECT table_name
FROM information_schema.columns
WHERE column_name = 'deleted_at'
AND table_schema = 'public'
ORDER BY table_name;

\echo ''
\echo '================================'

-- 8. 检查关键字段
\echo '8️⃣  检查关键字段...'

\echo ''
\echo '检查 users 表的 followers_count 和 following_count:'
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'followers_count'
    ) THEN '✅ followers_count 存在'
    ELSE '❌ followers_count 不存在'
  END AS followers_count_check,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name = 'following_count'
    ) THEN '✅ following_count 存在'
    ELSE '❌ following_count 不存在'
  END AS following_count_check;

\echo ''
\echo '检查 contents 表的 price_type 约束:'
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'contents'::regclass
AND conname LIKE '%price_type%';

\echo ''
\echo '================================'

-- 9. 检查已执行的迁移
\echo '9️⃣  检查已执行的迁移...'
SELECT
  CASE
    WHEN COUNT(*) >= 40 THEN '✅ 通过: ' || COUNT(*) || ' 个迁移已执行'
    ELSE '⚠️  警告: 只有 ' || COUNT(*) || ' 个迁移已执行'
  END AS result
FROM supabase_migrations.schema_migrations;

\echo ''
\echo '最近执行的 10 个迁移:'
SELECT
  version,
  inserted_at
FROM supabase_migrations.schema_migrations
ORDER BY inserted_at DESC
LIMIT 10;

\echo ''
\echo '================================'
\echo '✅ 验证完成!'
\echo '================================'
