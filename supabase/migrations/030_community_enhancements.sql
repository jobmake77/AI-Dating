-- =====================================================
-- Phase 3: 社区增强功能数据库迁移
-- 创建时间: 2026-03-08
-- 描述: 添加活动签到、通知扩展等功能
-- =====================================================

-- 1. 为 event_participants 表添加签到时间字段
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- 2. 为 notifications 表添加活动和社区关联字段
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- 3. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_event_participants_checked_in ON event_participants(event_id, checked_in_at);
CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_community_id ON notifications(community_id);

-- 4. 创建社区成员禁言表
CREATE TABLE IF NOT EXISTS community_member_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  banned_until TIMESTAMPTZ, -- NULL 表示永久禁言
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_community_member_bans_community_id ON community_member_bans(community_id);
CREATE INDEX IF NOT EXISTS idx_community_member_bans_user_id ON community_member_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_community_member_bans_banned_until ON community_member_bans(banned_until);

-- 5. 启用 RLS
ALTER TABLE community_member_bans ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略
-- 管理员和版主可以查看禁言记录
CREATE POLICY "Moderators can view bans"
  ON community_member_bans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_member_bans.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- 管理员和版主可以添加禁言
CREATE POLICY "Moderators can ban users"
  ON community_member_bans FOR INSERT
  WITH CHECK (
    banned_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_member_bans.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- 管理员和版主可以解除禁言
CREATE POLICY "Moderators can unban users"
  ON community_member_bans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_member_bans.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role IN ('admin', 'moderator')
    )
  );

-- 7. 创建辅助函数：检查用户是否被禁言
CREATE OR REPLACE FUNCTION is_user_banned(community_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  ban_record RECORD;
BEGIN
  SELECT * INTO ban_record
  FROM community_member_bans
  WHERE community_id = community_id_param
  AND user_id = user_id_param;

  -- 如果没有禁言记录，返回 false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 如果是永久禁言（banned_until 为 NULL），返回 true
  IF ban_record.banned_until IS NULL THEN
    RETURN TRUE;
  END IF;

  -- 如果禁言时间未到，返回 true
  IF ban_record.banned_until > NOW() THEN
    RETURN TRUE;
  END IF;

  -- 禁言时间已过，删除记录并返回 false
  DELETE FROM community_member_bans
  WHERE id = ban_record.id;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 迁移完成
-- =====================================================
