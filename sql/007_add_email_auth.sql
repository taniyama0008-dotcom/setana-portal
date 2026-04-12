-- メール認証用カラム追加
-- Supabase SQL Editor で実行してください

ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_auth_id UUID UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'line'
  CHECK (auth_provider IN ('line', 'email'));
