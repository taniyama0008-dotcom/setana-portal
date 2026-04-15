-- ============================================================
-- 003: reviews テーブル
-- 依存: users (001), spots (002)
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id             UUID        NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id             UUID        REFERENCES users(id) ON DELETE SET NULL,
  nickname            TEXT        NOT NULL,
  rating              INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text                TEXT,
  visit_date          TEXT,        -- 'YYYY-MM' 形式
  status              TEXT        NOT NULL DEFAULT 'public'
                                  CHECK (status IN ('public', 'hidden')),
  helpful_count       INTEGER     NOT NULL DEFAULT 0,
  -- 事業者返信
  business_reply      TEXT,
  business_reply_at   TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 公開口コミは誰でも読める
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'public');

-- 認証済みユーザーは口コミを投稿できる
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reviews_spot_id    ON reviews (spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id    ON reviews (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_status     ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);
