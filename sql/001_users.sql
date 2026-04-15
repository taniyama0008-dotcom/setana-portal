-- ============================================================
-- 001: users テーブル
-- 依存: なし（最初に作成）
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- LINE 認証
  line_user_id      TEXT        UNIQUE,
  line_display_name TEXT,
  line_picture_url  TEXT,
  -- メール認証
  supabase_auth_id  UUID        UNIQUE,
  auth_provider     TEXT        NOT NULL DEFAULT 'line'
                                CHECK (auth_provider IN ('line', 'email')),
  email             TEXT        UNIQUE,
  -- 共通プロフィール
  nickname          TEXT,
  avatar_url        TEXT,
  role              TEXT        NOT NULL DEFAULT 'user'
                                CHECK (role IN ('user', 'business', 'admin')),
  coin_balance      INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは自分のデータを読める
CREATE POLICY "users_self_read" ON users
  FOR SELECT TO authenticated
  USING (true); -- 一覧は service_role で取得するため anon には非公開

-- ユーザーは自分のニックネーム・アバターを更新できる
CREATE POLICY "users_self_update" ON users
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_line_user_id      ON users (line_user_id)     WHERE line_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_auth_id  ON users (supabase_auth_id)  WHERE supabase_auth_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email             ON users (email)             WHERE email IS NOT NULL;
CREATE INDEX        IF NOT EXISTS idx_users_role              ON users (role);
