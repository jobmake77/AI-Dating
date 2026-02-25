-- 允许管理员创建官方活动（official 类型）
-- 通过 users 表的 role 字段判断管理员身份

CREATE POLICY "events_insert_official_admin" ON events FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND type = 'official'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- 允许管理员更新任意活动（包括官方活动）
CREATE POLICY "events_update_admin" ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
