-- イベントカレンダーテーブル
CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE,
  area         TEXT CHECK (area IN ('setana', 'kitahiyama', 'taisei')),
  location     TEXT,
  spot_id      UUID REFERENCES spots(id) ON DELETE SET NULL,
  image_url    TEXT,
  external_url TEXT,
  is_annual    BOOLEAN NOT NULL DEFAULT FALSE,
  status       TEXT NOT NULL DEFAULT 'upcoming'
                 CHECK (status IN ('upcoming', 'ongoing', 'finished', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 公開イベントは誰でも読める
CREATE POLICY "events_public_read" ON events
  FOR SELECT USING (status != 'cancelled' OR TRUE);
-- ※ 管理は supabaseAdmin (service_role) のみが行うため INSERT/UPDATE/DELETE は RLS で制限

-- 全件読み取りを許可（anon も含む）
DROP POLICY IF EXISTS "events_public_read" ON events;
CREATE POLICY "events_anon_read" ON events
  FOR SELECT TO anon, authenticated USING (TRUE);
