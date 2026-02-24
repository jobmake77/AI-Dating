-- 检查 communities 相关的表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'communit%'
ORDER BY table_name;
