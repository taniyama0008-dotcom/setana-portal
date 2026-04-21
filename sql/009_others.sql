-- ============================================================
-- 009: その他テーブル
--   - business_spots  (users × spots 中間テーブル)
--   - jobs            (求人)
--   - events          (イベントカレンダー)
--   - reports         (通報)
--   - coin_transactions (コイン履歴)
--   - line_sessions   (LINE セッション管理)
-- 依存: users (001), spots (002)
-- ============================================================

-- ============================================================
-- business_spots: 事業者とスポットの紐づけ
-- ============================================================
CREATE TABLE IF NOT EXISTS business_spots (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id    UUID        NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, spot_id)
);

ALTER TABLE business_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_spots_read" ON business_spots
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can manage business_spots" ON business_spots
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_business_spots_user_id ON business_spots (user_id);
CREATE INDEX IF NOT EXISTS idx_business_spots_spot_id ON business_spots (spot_id);


-- ============================================================
-- jobs: 求人情報
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id       UUID        REFERENCES spots(id) ON DELETE SET NULL,
  title         TEXT        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'regular'
                            CHECK (type IN ('regular', 'seasonal', 'volunteer')),
  description   TEXT,
  salary_range  TEXT,
  requirements  TEXT,
  contact_info  TEXT,
  status        TEXT        NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 募集中の求人は誰でも読める
CREATE POLICY "jobs_public_read" ON jobs
  FOR SELECT TO anon, authenticated
  USING (status = 'open');

CREATE INDEX IF NOT EXISTS idx_jobs_user_id    ON jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_spot_id    ON jobs (spot_id) WHERE spot_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_type       ON jobs (type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);


-- ============================================================
-- events: イベントカレンダー
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  description  TEXT,
  start_date   DATE        NOT NULL,
  end_date     DATE,
  area         TEXT        CHECK (area IN ('setana', 'kitahiyama', 'taisei')),
  location     TEXT,
  spot_id      UUID        REFERENCES spots(id) ON DELETE SET NULL,
  image_url    TEXT,
  external_url TEXT,
  is_annual    BOOLEAN     NOT NULL DEFAULT FALSE,
  status       TEXT        NOT NULL DEFAULT 'upcoming'
                           CHECK (status IN ('upcoming', 'ongoing', 'finished', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_anon_read" ON events
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_status     ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_area       ON events (area) WHERE area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_is_annual  ON events (is_annual) WHERE is_annual = TRUE;


-- ============================================================
-- reports: 通報・おしえる
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number   TEXT        NOT NULL UNIQUE DEFAULT '',
  user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
  line_user_id    TEXT,
  reporter_name   TEXT,
  category        TEXT        NOT NULL CHECK (category IN (
                    'road', 'streetlight', 'park', 'snow', 'other',
                    'shop_closed', 'shop_hours', 'shop_crowded',
                    'weather', 'event_info', 'other_info'
                  )),
  report_type     TEXT        NOT NULL CHECK (report_type IN ('infrastructure', 'realtime_info')),
  description     TEXT,
  spot_id         UUID        REFERENCES spots(id) ON DELETE SET NULL,
  spot_name       TEXT,
  photo_url       TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  status          TEXT        NOT NULL DEFAULT 'received'
                              CHECK (status IN ('received', 'confirmed', 'in_progress', 'resolved', 'rejected')),
  is_public       BOOLEAN     NOT NULL DEFAULT FALSE,
  public_message  TEXT,
  forwarded_to    TEXT,
  forwarded_at    TIMESTAMPTZ,
  admin_note      TEXT,
  resolved_at     TIMESTAMPTZ,
  coins_awarded   INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_public_read" ON reports
  FOR SELECT TO anon, authenticated
  USING (is_public = TRUE);

-- 受付番号自動生成 trigger
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.report_number := 'R-' || TO_CHAR(NOW(), 'YYYY-MMDD') || '-' || LPAD(
    (
      SELECT COALESCE(
        MAX(CAST(SPLIT_PART(report_number, '-', 4) AS INTEGER)), 0
      ) + 1
      FROM reports
      WHERE report_number LIKE 'R-' || TO_CHAR(NOW(), 'YYYY-MMDD') || '-%'
    )::TEXT,
    3, '0'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_report_number
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION generate_report_number();

CREATE INDEX IF NOT EXISTS idx_reports_status      ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_user_id     ON reports (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_created_at  ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_is_public   ON reports (is_public) WHERE is_public = TRUE;


-- ============================================================
-- coin_transactions: コイン履歴
-- ============================================================
CREATE TABLE IF NOT EXISTS coin_transactions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount       INTEGER     NOT NULL,
  reason       TEXT        NOT NULL CHECK (reason IN (
                 'report_infra', 'report_info', 'photo_bonus',
                 'review', 'helpful_bonus', 'redeem'
               )),
  reference_id UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coin_tx_user_read" ON coin_transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user_id    ON coin_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_coin_tx_created_at ON coin_transactions (created_at DESC);


-- ============================================================
-- line_sessions: LINE Webhook セッション管理
-- ============================================================
CREATE TABLE IF NOT EXISTS line_sessions (
  line_user_id TEXT        PRIMARY KEY,
  state        TEXT        NOT NULL DEFAULT 'idle',
  context      JSONB       NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE line_sessions ENABLE ROW LEVEL SECURITY;
-- service_role のみアクセス（Webhook サーバーサイド専用）
