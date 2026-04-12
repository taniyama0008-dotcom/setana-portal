-- ============================================================
-- 005: 通報システム + コインシステム
-- ============================================================

-- users テーブルにコイン残高追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS coin_balance INTEGER DEFAULT 0;

-- ============================================================
-- LINE セッション管理テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS line_sessions (
  line_user_id TEXT PRIMARY KEY,
  state        TEXT NOT NULL DEFAULT 'idle',
  context      JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE line_sessions ENABLE ROW LEVEL SECURITY;
-- service_role のみアクセス（Webhook サーバーサイド専用）

-- ============================================================
-- 通報テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_number   TEXT UNIQUE NOT NULL DEFAULT '',
  user_id         UUID REFERENCES users(id),
  line_user_id    TEXT,
  reporter_name   TEXT,

  -- 分類
  category    TEXT NOT NULL CHECK (category IN (
    'road', 'streetlight', 'park', 'snow', 'other',
    'shop_closed', 'shop_hours', 'shop_crowded', 'weather', 'event_info', 'other_info'
  )),
  report_type TEXT NOT NULL CHECK (report_type IN ('infrastructure', 'realtime_info')),

  -- 内容
  description TEXT,
  spot_id     UUID REFERENCES spots(id),
  spot_name   TEXT,
  photo_url   TEXT,
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,

  -- ステータス
  status         TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received', 'confirmed', 'in_progress', 'resolved', 'rejected'
  )),
  is_public      BOOLEAN NOT NULL DEFAULT false,
  public_message TEXT,

  -- 転送
  forwarded_to TEXT,
  forwarded_at TIMESTAMPTZ,

  -- 管理
  admin_note    TEXT,
  resolved_at   TIMESTAMPTZ,
  coins_awarded INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 公開レポートは誰でも読める
CREATE POLICY "reports_public_read" ON reports
  FOR SELECT TO anon, authenticated USING (is_public = true);

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

CREATE TRIGGER set_report_number
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION generate_report_number();

-- ============================================================
-- コイン履歴テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS coin_transactions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES users(id) NOT NULL,
  amount       INTEGER NOT NULL,
  reason       TEXT NOT NULL CHECK (reason IN (
    'report_infra', 'report_info', 'photo_bonus', 'review', 'helpful_bonus', 'redeem'
  )),
  reference_id UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coin_tx_user_read" ON coin_transactions
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Supabase Storage: reports バケット作成（コンソールで実行）
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('reports', 'reports', true)
-- ON CONFLICT (id) DO NOTHING;
