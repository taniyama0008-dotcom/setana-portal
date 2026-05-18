-- Migration: photos テーブルを新規作成
-- Storage バケット「photos」を別途 Supabase ダッシュボードで作成すること:
--   public: true, file_size_limit: 10MB, allowed: image/jpeg,image/png,image/webp,image/heic

CREATE TABLE IF NOT EXISTS photos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id     UUID        REFERENCES spots(id) ON DELETE SET NULL,
  image_url   TEXT        NOT NULL,
  caption     TEXT        CHECK (char_length(caption) <= 200),
  visit_year  INTEGER,
  visit_month INTEGER     CHECK (visit_month BETWEEN 1 AND 12),
  status      TEXT        NOT NULL DEFAULT 'public' CHECK (status IN ('public', 'hidden')),
  is_featured BOOLEAN     NOT NULL DEFAULT FALSE,
  featured_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_status_created ON photos (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_user_created   ON photos (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_spot_status    ON photos (spot_id, status);
CREATE INDEX IF NOT EXISTS idx_photos_featured       ON photos (is_featured, featured_at DESC);

-- RLS: 読み取りは public=true のみ公開、書き込みは認証済みユーザーのみ
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public photos are visible" ON photos FOR SELECT USING (status = 'public');
CREATE POLICY "users can insert own photos" ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users can delete own photos" ON photos FOR DELETE USING (auth.uid() = user_id);
