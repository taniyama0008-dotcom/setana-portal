-- ============================================================
-- 005: spot_images テーブル
-- 依存: spots (002)
-- ============================================================

CREATE TABLE IF NOT EXISTS spot_images (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id    UUID        NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  image_url  TEXT        NOT NULL,
  alt_text   TEXT,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE spot_images ENABLE ROW LEVEL SECURITY;

-- 公開スポットの画像は誰でも読める
CREATE POLICY "spot_images_public_read" ON spot_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spots
      WHERE spots.id = spot_images.spot_id
        AND spots.status = 'public'
    )
  );

-- インデックス
CREATE INDEX IF NOT EXISTS idx_spot_images_spot_id    ON spot_images (spot_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_spot_images_created_at ON spot_images (created_at DESC);
