-- ============================================================
-- 002: spots テーブル
-- 依存: users (001)
-- ============================================================

CREATE TABLE IF NOT EXISTS spots (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  slug           TEXT        NOT NULL UNIQUE,
  section        TEXT        NOT NULL CHECK (section IN ('kurashi', 'shoku', 'shizen')),
  category       TEXT        NOT NULL DEFAULT '',
  area           TEXT,
  description    TEXT,
  address        TEXT,
  phone          TEXT,
  business_hours TEXT,
  holidays       TEXT,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  images         TEXT[]      NOT NULL DEFAULT '{}',
  cover_image    TEXT,
  status         TEXT        NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('public', 'draft', 'review')),
  -- 宿泊・施設拡張フィールド
  price_range    TEXT,
  has_onsen      BOOLEAN     NOT NULL DEFAULT FALSE,
  has_meals      BOOLEAN     NOT NULL DEFAULT FALSE,
  booking_url    TEXT,
  booking_phone  TEXT,
  room_count     INTEGER,
  capacity       INTEGER,
  website        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- 公開スポットは誰でも読める
CREATE POLICY "spots_public_read" ON spots
  FOR SELECT TO anon, authenticated
  USING (status = 'public');

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_spots_slug       ON spots (slug);
CREATE INDEX        IF NOT EXISTS idx_spots_section    ON spots (section);
CREATE INDEX        IF NOT EXISTS idx_spots_status     ON spots (status);
CREATE INDEX        IF NOT EXISTS idx_spots_category   ON spots (category);
CREATE INDEX        IF NOT EXISTS idx_spots_area       ON spots (area);
CREATE INDEX        IF NOT EXISTS idx_spots_location   ON spots (latitude, longitude)
                   WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
