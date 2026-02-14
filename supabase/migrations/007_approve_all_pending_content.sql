-- 将所有 pending 状态的内容改为 approved
-- 这是 MVP 阶段的快速修复

UPDATE contents
SET status = 'approved'
WHERE status = 'pending';

-- 验证更新
SELECT id, title, status, created_at
FROM contents
ORDER BY created_at DESC
LIMIT 10;
