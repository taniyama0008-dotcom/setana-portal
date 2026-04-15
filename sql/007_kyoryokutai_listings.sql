-- ============================================================
-- 007: kyoryokutai_listings テーブル
-- 依存: users (001)
-- ============================================================

CREATE TABLE IF NOT EXISTS kyoryokutai_listings (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug             TEXT        NOT NULL UNIQUE,
  title            TEXT        NOT NULL,
  catchphrase      TEXT,
  description      TEXT,
  duties           TEXT,
  salary_benefits  TEXT,
  housing_support  TEXT        NOT NULL DEFAULT 'none'
                               CHECK (housing_support IN ('provided', 'subsidized', 'none')),
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  contact_info     TEXT,
  application_url  TEXT,
  photos           TEXT[]      NOT NULL DEFAULT '{}',
  status           TEXT        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'published')),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE kyoryokutai_listings ENABLE ROW LEVEL SECURITY;

-- 公開済みは誰でも読める
CREATE POLICY "kyoryokutai_public_read" ON kyoryokutai_listings
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- 事業者は自分のレコードを読める（下書き含む）
CREATE POLICY "kyoryokutai_owner_read" ON kyoryokutai_listings
  FOR SELECT TO authenticated
  USING (true); -- user_id フィルタは server 側で担保

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_kyoryokutai_slug       ON kyoryokutai_listings (slug);
CREATE INDEX        IF NOT EXISTS idx_kyoryokutai_status     ON kyoryokutai_listings (status);
CREATE INDEX        IF NOT EXISTS idx_kyoryokutai_user_id    ON kyoryokutai_listings (user_id);
CREATE INDEX        IF NOT EXISTS idx_kyoryokutai_published  ON kyoryokutai_listings (published_at DESC)
                   WHERE published_at IS NOT NULL;
