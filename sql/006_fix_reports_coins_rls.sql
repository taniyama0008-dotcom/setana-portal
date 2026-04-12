-- ============================================================
-- 006: reports / coin_transactions RLS・トリガー修正
-- ============================================================

-- ─── coin_transactions: 全操作を許可 ─────────────────────────
-- service_role は RLS をバイパスするが、ポリシーを明示的に開放する
DROP POLICY IF EXISTS "coin_tx_user_read"              ON coin_transactions;
DROP POLICY IF EXISTS "coin_tx_insert_all"             ON coin_transactions;
DROP POLICY IF EXISTS "coin_tx_update_all"             ON coin_transactions;
DROP POLICY IF EXISTS "coin_tx_allow_all"              ON coin_transactions;
DROP POLICY IF EXISTS "Allow all on coin_transactions" ON coin_transactions;

CREATE POLICY "Allow all on coin_transactions" ON coin_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- ─── reports: 全操作を許可 ────────────────────────────────────
DROP POLICY IF EXISTS "reports_public_read"    ON reports;
DROP POLICY IF EXISTS "reports_service_insert" ON reports;
DROP POLICY IF EXISTS "Allow all on reports"   ON reports;

-- 公開レポートは誰でも読める
CREATE POLICY "reports_public_read" ON reports
  FOR SELECT TO anon, authenticated USING (is_public = true);

-- Webhook サーバー（service_role）からの INSERT/UPDATE を許可
CREATE POLICY "Allow all on reports" ON reports
  FOR ALL USING (true) WITH CHECK (true);

-- ─── users: LINE Webhook から INSERT できるよう許可 ───────────
-- （既存ポリシーと衝突する場合は DROP して再作成）
DROP POLICY IF EXISTS "users_line_insert" ON users;

CREATE POLICY "users_line_insert" ON users
  FOR INSERT WITH CHECK (true);

-- ─── generate_report_number トリガー: 冪等に再作成 ───────────
-- トリガーを一度削除してから再作成（CREATE TRIGGER は IF NOT EXISTS 非対応）
DROP TRIGGER IF EXISTS set_report_number ON reports;

CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TRIGGER AS $$
DECLARE
  today_prefix TEXT;
  next_seq     INTEGER;
BEGIN
  today_prefix := 'R-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Tokyo', 'YYYYMMDD');

  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(report_number FROM LENGTH(today_prefix) + 2)
        AS INTEGER
      )
    ), 0
  ) + 1
  INTO next_seq
  FROM reports
  WHERE report_number LIKE today_prefix || '-%';

  NEW.report_number := today_prefix || '-' || LPAD(next_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_number
  BEFORE INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION generate_report_number();
