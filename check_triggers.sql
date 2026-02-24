-- 检查 communities 相关的触发器
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table LIKE 'communit%'
ORDER BY event_object_table, trigger_name;
