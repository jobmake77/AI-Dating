-- =====================================================
-- Phase 4: 后台管理基础能力
-- 创建时间: 2026-03-15
-- 描述: 补齐标签、平台社区、活动、隐私请求、社区规则的后台管理权限与数据模型
-- =====================================================

-- =====================================================
-- 1. 社区规则表
-- =====================================================

CREATE TABLE IF NOT EXISTS community_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT community_rules_rule_text_length
    CHECK (char_length(rule_text) >= 2 AND char_length(rule_text) <= 200),
  CONSTRAINT community_rules_sort_order_range
    CHECK (sort_order >= 0 AND sort_order <= 9999)
);

CREATE INDEX IF NOT EXISTS idx_community_rules_community_id
  ON community_rules(community_id);

CREATE INDEX IF NOT EXISTS idx_community_rules_sort_order
  ON community_rules(community_id, sort_order, created_at);

DROP TRIGGER IF EXISTS update_community_rules_updated_at ON community_rules;
CREATE TRIGGER update_community_rules_updated_at
  BEFORE UPDATE ON community_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE community_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view community rules" ON community_rules;
CREATE POLICY "Anyone can view community rules"
  ON community_rules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Managers can manage community rules" ON community_rules;
CREATE POLICY "Managers can manage community rules"
  ON community_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_rules.community_id
        AND communities.creator_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_rules.community_id
        AND community_members.user_id = auth.uid()
        AND community_members.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_rules.community_id
        AND communities.creator_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_rules.community_id
        AND community_members.user_id = auth.uid()
        AND community_members.role IN ('admin', 'moderator')
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON community_rules TO authenticated;

INSERT INTO community_rules (community_id, rule_text, sort_order)
SELECT
  communities.id,
  seeded_rules.rule_text,
  seeded_rules.sort_order
FROM communities
CROSS JOIN (
  VALUES
    ('保持友善，尊重他人', 10),
    ('内容需与社区主题相关', 20),
    ('禁止广告和垃圾信息', 30),
    ('遵守社区发帖规范', 40)
) AS seeded_rules(rule_text, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM community_rules
  WHERE community_rules.community_id = communities.id
);

-- =====================================================
-- 2. 标签后台管理权限
-- =====================================================

DROP POLICY IF EXISTS "Admins can update tags" ON tags;
CREATE POLICY "Admins can update tags"
  ON tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete tags" ON tags;
CREATE POLICY "Admins can delete tags"
  ON tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage content tags" ON content_tags;
CREATE POLICY "Admins can manage content tags"
  ON content_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_tags TO authenticated;

-- =====================================================
-- 3. 平台级社区、活动与隐私请求后台权限
-- =====================================================

DROP POLICY IF EXISTS "Platform admins can update communities" ON communities;
CREATE POLICY "Platform admins can update communities"
  ON communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Platform admins can delete communities" ON communities;
CREATE POLICY "Platform admins can delete communities"
  ON communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "events_delete_admin" ON events;
CREATE POLICY "events_delete_admin"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all export requests" ON data_export_requests;
CREATE POLICY "Admins can update all export requests"
  ON data_export_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all deletion requests" ON account_deletion_requests;
CREATE POLICY "Admins can update all deletion requests"
  ON account_deletion_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users AS admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update comments" ON comments;
CREATE POLICY "Admins can update comments"
  ON comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

GRANT UPDATE ON users TO authenticated;
GRANT DELETE ON events TO authenticated;
GRANT UPDATE ON comments TO authenticated;
GRANT UPDATE ON data_export_requests TO authenticated;
GRANT UPDATE ON account_deletion_requests TO authenticated;
