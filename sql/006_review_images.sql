-- ============================================================
-- 006: review_images テーブル
-- 依存: reviews (003)
-- ============================================================

CREATE TABLE IF NOT EXISTS review_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  alt_text   TEXT
);

-- RLS
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

-- 公開口コミの画像は誰でも読める
CREATE POLICY "review_images_public_read" ON review_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id = review_images.review_id
        AND reviews.status = 'public'
    )
  );

-- 口コミ投稿時に画像を追加できる（anon 含む）
CREATE POLICY "review_images_insert" ON review_images
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images (review_id);
