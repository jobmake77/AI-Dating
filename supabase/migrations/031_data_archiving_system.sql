-- =====================================================
-- 数据归档系统
-- 创建时间: 2026-03-08
-- 描述: 实现历史数据归档，冷热数据分离
-- =====================================================

-- =====================================================
-- 1. 创建归档表
-- =====================================================

-- 归档内容表
CREATE TABLE IF NOT EXISTS contents_archive (
  LIKE contents INCLUDING ALL
);

-- 归档评论表
CREATE TABLE IF NOT EXISTS comments_archive (
  LIKE comments INCLUDING ALL
);

-- 归档消息表
CREATE TABLE IF NOT EXISTS messages_archive (
  LIKE messages INCLUDING ALL
);

-- 归档通知表
CREATE TABLE IF NOT EXISTS notifications_archive (
  LIKE notifications INCLUDING ALL
);

-- 归档点赞表
CREATE TABLE IF NOT EXISTS likes_archive (
  LIKE likes INCLUDING ALL
);

-- 归档转发表
CREATE TABLE IF NOT EXISTS reposts_archive (
  LIKE reposts INCLUDING ALL
);

-- =====================================================
-- 2. 创建归档索引
-- =====================================================

-- Contents Archive 索引
CREATE INDEX IF NOT EXISTS idx_contents_archive_author_created
ON contents_archive(author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contents_archive_created
ON contents_archive(created_at DESC);

-- Comments Archive 索引
CREATE INDEX IF NOT EXISTS idx_comments_archive_content_created
ON comments_archive(content_id, created_at DESC);

-- Messages Archive 索引
CREATE INDEX IF NOT EXISTS idx_messages_archive_conversation_created
ON messages_archive(conversation_id, created_at DESC);

-- Notifications Archive 索引
CREATE INDEX IF NOT EXISTS idx_notifications_archive_user_created
ON notifications_archive(user_id, created_at DESC);

-- =====================================================
-- 3. 创建归档函数
-- =====================================================

-- 归档旧内容（超过 1 年的已删除或拒绝的内容）
CREATE OR REPLACE FUNCTION archive_old_contents()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- 将旧内容移动到归档表
  WITH moved_rows AS (
    DELETE FROM contents
    WHERE (status = 'rejected' OR status = 'deleted')
      AND created_at < NOW() - INTERVAL '1 year'
    RETURNING *
  )
  INSERT INTO contents_archive
  SELECT * FROM moved_rows;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 归档旧评论（超过 2 年的评论）
CREATE OR REPLACE FUNCTION archive_old_comments()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH moved_rows AS (
    DELETE FROM comments
    WHERE created_at < NOW() - INTERVAL '2 years'
    RETURNING *
  )
  INSERT INTO comments_archive
  SELECT * FROM moved_rows;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 归档旧消息（超过 1 年的消息）
CREATE OR REPLACE FUNCTION archive_old_messages()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH moved_rows AS (
    DELETE FROM messages
    WHERE created_at < NOW() - INTERVAL '1 year'
    RETURNING *
  )
  INSERT INTO messages_archive
  SELECT * FROM moved_rows;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 归档旧通知（超过 6 个月的已读通知）
CREATE OR REPLACE FUNCTION archive_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH moved_rows AS (
    DELETE FROM notifications
    WHERE is_read = true
      AND created_at < NOW() - INTERVAL '6 months'
    RETURNING *
  )
  INSERT INTO notifications_archive
  SELECT * FROM moved_rows;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 归档旧点赞记录（超过 2 年的点赞）
CREATE OR REPLACE FUNCTION archive_old_likes()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  WITH moved_rows AS (
    DELETE FROM likes
    WHERE created_at < NOW() - INTERVAL '2 years'
    RETURNING *
  )
  INSERT INTO likes_archive
  SELECT * FROM moved_rows;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. 创建归档日志表
-- =====================================================

CREATE TABLE IF NOT EXISTS archive_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  archived_count INTEGER NOT NULL,
  archive_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_archive_logs_date
ON archive_logs(archive_date DESC);

-- =====================================================
-- 5. 创建统一归档函数
-- =====================================================

CREATE OR REPLACE FUNCTION run_all_archiving()
RETURNS TABLE(
  table_name TEXT,
  archived_count INTEGER,
  status TEXT,
  error_message TEXT
) AS $$
DECLARE
  count_val INTEGER;
  error_msg TEXT;
BEGIN
  -- 归档内容
  BEGIN
    count_val := archive_old_contents();
    INSERT INTO archive_logs (table_name, archived_count, status)
    VALUES ('contents', count_val, 'success');
    RETURN QUERY SELECT 'contents'::TEXT, count_val, 'success'::TEXT, NULL::TEXT;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    INSERT INTO archive_logs (table_name, archived_count, status, error_message)
    VALUES ('contents', 0, 'failed', error_msg);
    RETURN QUERY SELECT 'contents'::TEXT, 0, 'failed'::TEXT, error_msg;
  END;

  -- 归档评论
  BEGIN
    count_val := archive_old_comments();
    INSERT INTO archive_logs (table_name, archived_count, status)
    VALUES ('comments', count_val, 'success');
    RETURN QUERY SELECT 'comments'::TEXT, count_val, 'success'::TEXT, NULL::TEXT;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    INSERT INTO archive_logs (table_name, archived_count, status, error_message)
    VALUES ('comments', 0, 'failed', error_msg);
    RETURN QUERY SELECT 'comments'::TEXT, 0, 'failed'::TEXT, error_msg;
  END;

  -- 归档消息
  BEGIN
    count_val := archive_old_messages();
    INSERT INTO archive_logs (table_name, archived_count, status)
    VALUES ('messages', count_val, 'success');
    RETURN QUERY SELECT 'messages'::TEXT, count_val, 'success'::TEXT, NULL::TEXT;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    INSERT INTO archive_logs (table_name, archived_count, status, error_message)
    VALUES ('messages', 0, 'failed', error_msg);
    RETURN QUERY SELECT 'messages'::TEXT, 0, 'failed'::TEXT, error_msg;
  END;

  -- 归档通知
  BEGIN
    count_val := archive_old_notifications();
    INSERT INTO archive_logs (table_name, archived_count, status)
    VALUES ('notifications', count_val, 'success');
    RETURN QUERY SELECT 'notifications'::TEXT, count_val, 'success'::TEXT, NULL::TEXT;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    INSERT INTO archive_logs (table_name, archived_count, status, error_message)
    VALUES ('notifications', 0, 'failed', error_msg);
    RETURN QUERY SELECT 'notifications'::TEXT, 0, 'failed'::TEXT, error_msg;
  END;

  -- 归档点赞
  BEGIN
    count_val := archive_old_likes();
    INSERT INTO archive_logs (table_name, archived_count, status)
    VALUES ('likes', count_val, 'success');
    RETURN QUERY SELECT 'likes'::TEXT, count_val, 'success'::TEXT, NULL::TEXT;
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    INSERT INTO archive_logs (table_name, archived_count, status, error_message)
    VALUES ('likes', 0, 'failed', error_msg);
    RETURN QUERY SELECT 'likes'::TEXT, 0, 'failed'::TEXT, error_msg;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. 创建归档数据查询视图
-- =====================================================

-- 所有内容视图（包含归档）
CREATE OR REPLACE VIEW all_contents AS
SELECT *, false AS is_archived FROM contents
UNION ALL
SELECT *, true AS is_archived FROM contents_archive;

-- 所有评论视图（包含归档）
CREATE OR REPLACE VIEW all_comments AS
SELECT *, false AS is_archived FROM comments
UNION ALL
SELECT *, true AS is_archived FROM comments_archive;

-- 所有消息视图（包含归档）
CREATE OR REPLACE VIEW all_messages AS
SELECT *, false AS is_archived FROM messages
UNION ALL
SELECT *, true AS is_archived FROM messages_archive;

-- =====================================================
-- 7. 启用归档表 RLS
-- =====================================================

ALTER TABLE contents_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE reposts_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_logs ENABLE ROW LEVEL SECURITY;

-- 归档表 RLS 策略（只有管理员可以访问）
CREATE POLICY "Only admins can view archived contents"
ON contents_archive FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can view archived comments"
ON comments_archive FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can view archived messages"
ON messages_archive FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Only admins can view archive logs"
ON archive_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
