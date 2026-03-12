-- =====================================================
-- 044: 添加缺失的外键约束
-- =====================================================
-- 目标: 确保所有关系表都有正确的外键约束
-- 原因: 防止孤立记录和数据不一致

-- 1. 检查并添加 likes 表的外键约束
DO $$
BEGIN
  -- 添加 content_id 外键（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'likes_content_id_fkey'
    AND table_name = 'likes'
  ) THEN
    ALTER TABLE likes
    ADD CONSTRAINT likes_content_id_fkey
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE;
  END IF;

  -- 添加 user_id 外键（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'likes_user_id_fkey'
    AND table_name = 'likes'
  ) THEN
    ALTER TABLE likes
    ADD CONSTRAINT likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. 检查并添加 reposts 表的外键约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reposts_content_id_fkey'
    AND table_name = 'reposts'
  ) THEN
    ALTER TABLE reposts
    ADD CONSTRAINT reposts_content_id_fkey
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reposts_user_id_fkey'
    AND table_name = 'reposts'
  ) THEN
    ALTER TABLE reposts
    ADD CONSTRAINT reposts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. 检查并添加 follows 表的外键约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'follows_follower_id_fkey'
    AND table_name = 'follows'
  ) THEN
    ALTER TABLE follows
    ADD CONSTRAINT follows_follower_id_fkey
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'follows_following_id_fkey'
    AND table_name = 'follows'
  ) THEN
    ALTER TABLE follows
    ADD CONSTRAINT follows_following_id_fkey
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. 检查并添加 content_tags 表的外键约束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_tags_content_id_fkey'
    AND table_name = 'content_tags'
  ) THEN
    ALTER TABLE content_tags
    ADD CONSTRAINT content_tags_content_id_fkey
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_tags_tag_id_fkey'
    AND table_name = 'content_tags'
  ) THEN
    ALTER TABLE content_tags
    ADD CONSTRAINT content_tags_tag_id_fkey
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. 添加注释
COMMENT ON CONSTRAINT likes_content_id_fkey ON likes IS '确保点赞关联的内容存在';
COMMENT ON CONSTRAINT likes_user_id_fkey ON likes IS '确保点赞的用户存在';
COMMENT ON CONSTRAINT reposts_content_id_fkey ON reposts IS '确保转发关联的内容存在';
COMMENT ON CONSTRAINT reposts_user_id_fkey ON reposts IS '确保转发的用户存在';
COMMENT ON CONSTRAINT follows_follower_id_fkey ON follows IS '确保关注者存在';
COMMENT ON CONSTRAINT follows_following_id_fkey ON follows IS '确保被关注者存在';
COMMENT ON CONSTRAINT content_tags_content_id_fkey ON content_tags IS '确保标签关联的内容存在';
COMMENT ON CONSTRAINT content_tags_tag_id_fkey ON content_tags IS '确保内容关联的标签存在';
