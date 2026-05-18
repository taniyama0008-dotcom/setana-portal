-- Migration: photos Storage バケット作成 + RLS ポリシー
-- 実行場所: Supabase Dashboard → SQL Editor
-- 前提: sql/015_photos.sql が適用済みであること

-- ============================================================
-- 1. Storage バケット作成
-- ============================================================
-- file_size_limit: 10MB = 10485760 bytes
-- allowed_mime_types: HEIC は 'image/heic' または 'image/heif' で登録される場合があるため両方指定

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ============================================================
-- 2. Storage オブジェクト INSERT ポリシー
--    PhotoSubmitForm.tsx が supabase（anon/authenticated client）で
--    直接アップロードするため、このポリシーが必要。
-- ============================================================
DROP POLICY IF EXISTS "photos_objects_insert" ON storage.objects;

CREATE POLICY "photos_objects_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'photos');


-- ============================================================
-- 3. 動作確認クエリ（実行後に確認）
-- ============================================================
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets
-- WHERE id = 'photos';
