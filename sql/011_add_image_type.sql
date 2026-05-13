-- ============================================================
-- 011: spot_images に image_type カラムを追加
-- ============================================================

ALTER TABLE spot_images
  ADD COLUMN IF NOT EXISTS image_type TEXT NOT NULL DEFAULT 'inline'
    CHECK (image_type IN ('cover', 'inline', 'gallery'));
