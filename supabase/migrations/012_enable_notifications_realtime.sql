-- ============================================
-- 启用通知表的 Realtime 功能
-- 执行日期: 2026-02-16
-- ============================================

-- 为 notifications 表启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 注意：如果 supabase_realtime publication 不存在，需要先创建
-- 这通常在 Supabase 项目初始化时自动创建
-- 如果遇到错误，可以先创建 publication：
-- CREATE PUBLICATION supabase_realtime;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
