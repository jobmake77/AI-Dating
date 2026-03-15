-- 社区创建者默认成为版主，而不是管理员
-- 现有社区中，创建者成员角色也同步调整为 moderator

ALTER FUNCTION IF EXISTS add_creator_as_admin() RENAME TO add_creator_as_moderator;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'add_creator_as_admin_trigger'
  ) THEN
    ALTER TRIGGER add_creator_as_admin_trigger
    ON communities
    RENAME TO add_creator_as_moderator_trigger;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION add_creator_as_moderator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'moderator');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE community_members AS cm
SET role = 'moderator'
FROM communities AS c
WHERE cm.community_id = c.id
  AND cm.user_id = c.creator_id
  AND cm.role = 'admin';
