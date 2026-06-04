-- ============================================================
-- 019_category_settings_parents.sql
-- 親カテゴリ(travel/life/connect)の category_settings レコードを追加
-- ヒーロー画像・グラデーション管理を中間階層ページに対応させる
-- ON CONFLICT DO NOTHING で再実行安全
-- ============================================================

INSERT INTO category_settings
  (category_path, hero_gradient_from, hero_gradient_via, hero_gradient_to)
VALUES
  ('travel',  '#1a2a35', '#2d4a5e', '#1a2a20'),
  ('life',    '#1a2a35', '#3d5a6e', '#2a3d2a'),
  ('connect', '#0f1e1b', '#1a3028', '#1a2030')
ON CONFLICT (category_path) DO NOTHING;
