-- =====================================================
-- 043: 统一价格类型
-- =====================================================
-- 目标: 统一所有价格类型为 'free' 和 'member'
-- 原因: 当前存在 'member_only' 和 'member' 两种会员类型，造成混淆

-- 1. 将所有 'member_only' 更新为 'member'
UPDATE contents
SET price_type = 'member'
WHERE price_type = 'member_only';

-- 2. 删除旧的约束
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_price_type_check;

-- 3. 添加新的约束（只允许 'free' 和 'member'）
ALTER TABLE contents ADD CONSTRAINT contents_price_type_check
  CHECK (price_type IN ('free', 'member'));

-- 4. 为 price_type 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_contents_price_type
ON contents(price_type)
WHERE deleted_at IS NULL;

-- 5. 添加注释
COMMENT ON COLUMN contents.price_type IS '内容价格类型: free=免费, member=会员专享';
