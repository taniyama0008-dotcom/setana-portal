-- ============================================================
-- 017_category_settings.sql
-- カテゴリページのヒーロー画像・グラデーション・リード文を管理するテーブル
-- 更新時はアプリから updated_at を明示的に渡すこと（trigger なし）
-- ============================================================

CREATE TABLE IF NOT EXISTS category_settings (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_path      text        UNIQUE NOT NULL,
  hero_image_url     text,
  hero_image_alt     text        CHECK (char_length(hero_image_alt) <= 100),
  hero_gradient_from text,
  hero_gradient_via  text,
  hero_gradient_to   text,
  description        text        CHECK (char_length(description) <= 500),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE category_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category_settings_select"
  ON category_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "category_settings_write"
  ON category_settings FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ── 初期データ（既存ハードコード値を移行、見た目を維持） ───
INSERT INTO category_settings
  (category_path, hero_gradient_from, hero_gradient_via, hero_gradient_to)
VALUES
  ('travel/gourmet',             '#5c3320', '#c47e4f', '#8a5535'),
  ('travel/nature',              '#1a3020', '#6b8f71', '#3d5c42'),
  ('travel/onsen',               '#1a2e3d', '#5b7e95', '#3d5a6e'),
  ('travel/stay',                '#1a2535', '#3d5a6e', '#2a3f50'),
  ('travel/access',              '#2a2a2a', '#4a4a4a', '#3a3a3a'),
  ('travel/fishing',             '#1a2e20', '#2d5c3a', '#1a3040'),
  ('life/work',                  '#5c3320', '#c47e4f', '#8a5535'),
  ('life/living',                '#1a2a35', '#5b7e95', '#3d5a6e'),
  ('life/migration',             '#1a3020', '#6b8f71', '#3d5c42'),
  ('connect/furusato',           '#0f1e1b', '#1a3028', '#1a2820'),
  ('connect/corporate-furusato', '#0f1520', '#1a2530', '#1a3028'),
  ('connect/famimatch',          '#2a1008', '#7a3010', '#b85a28'),
  ('connect/relation',           '#1a2820', '#2d4028', '#1a3028')
ON CONFLICT (category_path) DO NOTHING;
