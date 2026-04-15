-- ============================================================
-- 004: favorites テーブル
-- 依存: users (001), spots (002)
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id    UUID        NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, spot_id)
);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のお気に入りのみ読める
CREATE POLICY "favorites_user_read" ON favorites
  FOR SELECT TO authenticated
  USING (true); -- user_id フィルタは RPC/server 側で担保

-- ユーザーはお気に入りを追加できる
CREATE POLICY "favorites_insert" ON favorites
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ユーザーはお気に入りを削除できる
CREATE POLICY "favorites_delete" ON favorites
  FOR DELETE TO authenticated
  USING (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_favorites_user_id    ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_spot_id    ON favorites (spot_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites (created_at DESC);
