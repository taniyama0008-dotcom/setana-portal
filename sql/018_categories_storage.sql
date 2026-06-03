-- ============================================================
-- 018_categories_storage.sql
-- categories Storage バケット作成 + RLS ポリシー
-- 前提: sql/017_category_settings.sql が適用済みであること
-- アップロード・更新・削除は管理者（service_role）のみ。
-- ============================================================

-- ── 1. Storage バケット作成 ──────────────────────────────────
-- file_size_limit: 10MB = 10485760 bytes
-- allowed_mime_types: photos / spots バケットと同一設定
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'categories',
  'categories',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── 2. SELECT ポリシー（パブリック読み取り） ────────────────
DROP POLICY IF EXISTS "categories_objects_select" ON storage.objects;

CREATE POLICY "categories_objects_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'categories');

-- ── 3. INSERT ポリシー（service_role のみ） ─────────────────
DROP POLICY IF EXISTS "categories_objects_insert" ON storage.objects;

CREATE POLICY "categories_objects_insert" ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'categories');

-- ── 4. UPDATE ポリシー（service_role のみ） ─────────────────
DROP POLICY IF EXISTS "categories_objects_update" ON storage.objects;

CREATE POLICY "categories_objects_update" ON storage.objects
  FOR UPDATE TO service_role
  USING (bucket_id = 'categories');

-- ── 5. DELETE ポリシー（service_role のみ） ─────────────────
DROP POLICY IF EXISTS "categories_objects_delete" ON storage.objects;

CREATE POLICY "categories_objects_delete" ON storage.objects
  FOR DELETE TO service_role
  USING (bucket_id = 'categories');

-- ── 動作確認クエリ ──────────────────────────────────────────
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'categories';
