-- ============================================================
-- 012: Security Advisor 対策 — RLS ポリシー締め直し（最終版）
--
-- ⚠️  本番 DB 適用前に必ずレビューすること。
--     適用後は SETANA 全機能の動作確認を行うこと。
--
-- 【このアプリの認証モデルについての重要な注記】
--   - supabase.ts は createClient(url, ANON_KEY) のみ。
--     Supabase Auth を使用していない。
--   - 認証は独自クッキー（setana_uid / setana_role）で管理。
--   - したがって auth.uid() は常に NULL。
--   - 全 INSERT/UPDATE/DELETE はサーバー側で supabaseAdmin
--     (service_role) 経由で行うのが正しい設計。
--
-- 【Cat-1 の対処方針】
--   auth.uid() が使えないため、ポリシーによるユーザー紐づけ制限は不可。
--   代わりに:
--   A) service_role しか使わないテーブル → ポリシーを削除
--      (ポリシーなし = anon/authenticated クライアントから操作不可、
--       service_role は RLS をバイパスするので問題なし)
--   B) anon クライアントからの操作が必要なテーブル → 意味のある条件に変更
--      (reviews INSERT: review.ts が supabase anon を使っているため維持)
--
-- 【推奨コード変更（SQL と別に対応してほしい）】
--   src/app/actions/review.ts の import 変更:
--     - import { supabase } from '@/lib/supabase'
--     + import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
--   これにより reviews / review_images の anon INSERT ポリシーが不要になる。
--
-- 対象警告カテゴリ:
--   Cat-1: RLS Policy Always True   ~20件
--   Cat-4: Function Search Path Mutable   2件
--   Cat-2: Storage Listing → 末尾コメント参照（ポリシー名要確認）
--   Cat-3: Password Protection → Dashboard 手動対応
-- ============================================================


-- ============================================================
-- users
-- 対処: 既存の USING(true) / WITH CHECK(true) ポリシーをすべて削除
-- 理由: 全操作が supabaseAdmin (service_role) 経由。
--       anon/authenticated クライアントから users を直接操作する経路なし。
-- ============================================================
DROP POLICY IF EXISTS "users_self_read"   ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;
DROP POLICY IF EXISTS "users_line_insert" ON users;
-- ポリシーなし = service_role 以外からのアクセス不可 ✅


-- ============================================================
-- favorites
-- 対処: 既存の USING(true) / WITH CHECK(true) ポリシーをすべて削除
-- 理由: お気に入り操作は server action (supabaseAdmin) 経由のみ。
-- ============================================================
DROP POLICY IF EXISTS "favorites_user_read" ON favorites;
DROP POLICY IF EXISTS "favorites_insert"    ON favorites;
DROP POLICY IF EXISTS "favorites_delete"    ON favorites;
-- ポリシーなし = service_role 以外からのアクセス不可 ✅


-- ============================================================
-- business_spots
-- 対処: 既存の USING(true) / WITH CHECK(true) ポリシーをすべて削除
-- 理由: 管理画面は supabaseAdmin 経由のみ。
-- ============================================================
DROP POLICY IF EXISTS "business_spots_read"             ON business_spots;
DROP POLICY IF EXISTS "Admin can manage business_spots" ON business_spots;
-- ポリシーなし = service_role 以外からのアクセス不可 ✅


-- ============================================================
-- coin_transactions
-- 対処: USING(true) の "Allow all" ポリシーを削除
-- 理由: コイン操作は Webhook/server action (supabaseAdmin) 経由のみ。
-- ============================================================
DROP POLICY IF EXISTS "coin_tx_user_read"              ON coin_transactions;
DROP POLICY IF EXISTS "Allow all on coin_transactions" ON coin_transactions;
-- ポリシーなし = service_role 以外からのアクセス不可 ✅


-- ============================================================
-- reviews
-- 対処: INSERT の WITH CHECK(true) に意味のある条件を追加
--
-- ⚠️  現在 review.ts が supabase (anon key) を使っているため
--     anon の INSERT を許可し続けている。
--     review.ts を supabaseAdmin に変更した後は
--     このポリシーを DROP して構わない。
-- ============================================================
DROP POLICY IF EXISTS "reviews_insert" ON reviews;

-- INSERT: anon + authenticated 許可（公開スポットへの投稿のみ）
-- review.ts を supabaseAdmin に変更後は削除可
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spots
      WHERE spots.id = spot_id
        AND spots.status = 'public'
    )
    AND length(coalesce(nickname, '')) BETWEEN 1 AND 50
    AND rating BETWEEN 1 AND 5
  );

-- UPDATE: ポリシーなし（service_role のみ — 管理画面から対応）
-- DELETE: ポリシーなし（service_role のみ）


-- ============================================================
-- review_images
-- 対処: INSERT の WITH CHECK(true) に意味のある条件を追加
--
-- ⚠️  review.ts が supabase (anon) を使っているため anon 許可を維持。
--     review.ts を supabaseAdmin に変更後は DROP して構わない。
-- ============================================================
DROP POLICY IF EXISTS "review_images_insert" ON review_images;

-- INSERT: 存在するレビューへの画像追加のみ許可
-- review.ts を supabaseAdmin に変更後は削除可
CREATE POLICY "review_images_insert" ON review_images
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id = review_id
    )
  );


-- ============================================================
-- reports
-- 対処: "Allow all on reports" を削除し、用途別に分割
-- ============================================================
DROP POLICY IF EXISTS "Allow all on reports" ON reports;
-- reports_public_read (USING(is_public = true)) は正しいので変更なし

-- INSERT: anon + authenticated（LINE Bot は service_role でバイパス済み。
--         Web フォームが anon クライアントを使う場合のため残す）
CREATE POLICY "reports_insert" ON reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
-- ↑ reports INSERT に意味のある制約を掛けるには
--   category/report_type の値チェックが最低限有効だが、
--   CHECK 制約が既にカラムに存在するため WITH CHECK(true) でも二重保護される。

-- UPDATE / DELETE: ポリシーなし（service_role のみ — 管理画面から対応）


-- ============================================================
-- events
-- 対処: USING(TRUE) → キャンセル済みを除外する条件に変更
-- ============================================================
DROP POLICY IF EXISTS "events_anon_read" ON events;

-- SELECT: cancelled 以外のイベントを公開（過去のイベントも表示する方針）
-- もし開催予定・開催中のみ表示したい場合は:
--   USING (status IN ('upcoming', 'ongoing'))
CREATE POLICY "events_public_read" ON events
  FOR SELECT TO anon, authenticated
  USING (status <> 'cancelled');

-- INSERT / UPDATE / DELETE: ポリシーなし（service_role のみ）


-- ============================================================
-- Cat-4: Function Search Path Mutable の修正
-- generate_report_number と update_updated_at に
-- SET search_path = public, pg_temp を追加
-- ============================================================

-- generate_report_number（006_fix_reports_coins_rls.sql の最新版を上書き）
CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  today_prefix TEXT;
  next_seq     INTEGER;
BEGIN
  today_prefix := 'R-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Tokyo', 'YYYYMMDD');
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(report_number FROM LENGTH(today_prefix) + 2) AS INTEGER)), 0
  ) + 1
  INTO next_seq
  FROM reports
  WHERE report_number LIKE today_prefix || '-%';
  NEW.report_number := today_prefix || '-' || LPAD(next_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

-- update_updated_at（DB 上に存在する想定。search_path を追加して上書き）
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ============================================================
-- Cat-2: Storage バケットリスト制限
--
-- ⚠️ 以下のクエリを Supabase SQL Editor で先に実行し、
--    実際のポリシー名を確認してから DROP すること:
--
--   SELECT policyname, cmd, qual, with_check, roles
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects'
--   ORDER BY policyname;
--
-- 方針:
--   - 公開 CDN URL (publicUrl) は RLS を経由しないため画像表示は影響なし
--   - supabase.storage.list() を anon から呼べないよう制限する
--   - admin (service_role) は RLS バイパスのため影響なし
--
-- ポリシー名確認後に実行する DROP の例（名前は実際のものに置き換える）:
--
-- DROP POLICY IF EXISTS "Give public access to spots bucket" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Access"                      ON storage.objects;
-- ... (実際の名前に合わせること)
--
-- 削除後の代替ポリシー（list() を admin のみに制限、CDN アクセスは継続）:
--
-- spots: 管理画面(supabaseAdmin)がリストを使う → service_role で対応済み
-- anon/authenticated クライアントからのリスト取得は不可にする
--
-- CREATE POLICY "spots_no_anon_list" ON storage.objects
--   FOR SELECT TO anon, authenticated
--   USING (
--     bucket_id = 'spots'
--     AND name ~ '\.[a-zA-Z0-9]{2,5}$'  -- 拡張子付きファイルのみ（フォルダ一覧を防ぐ）
--   );
--
-- reviews バケット（ReviewForm が anon upload するため SELECT も維持）:
-- CREATE POLICY "reviews_objects_read" ON storage.objects
--   FOR SELECT TO anon, authenticated
--   USING (bucket_id = 'reviews' AND name ~ '\.[a-zA-Z0-9]{2,5}$');
--
-- articles / events / reports バケット（管理専用 → ポリシーなし = service_role のみ）:
-- DROP POLICY IF EXISTS "Give public access to articles bucket" ON storage.objects;
-- DROP POLICY IF EXISTS "Give public access to events bucket"   ON storage.objects;
-- DROP POLICY IF EXISTS "Give public access to reports bucket"  ON storage.objects;
-- ============================================================


-- ============================================================
-- Cat-3: Leaked Password Protection
-- ダッシュボードで手動対応:
--   Authentication → Sign In / Up → Password Protection → ON
-- ============================================================


-- ============================================================
-- 適用後の動作確認チェックリスト
--
-- □ 未ログインでスポット一覧・詳細が表示される（spots SELECT）
-- □ 未ログインで口コミが読める（reviews_public_read）
-- □ ログイン済みで口コミを投稿できる（reviews_insert）
-- □ 口コミに写真を添付して投稿できる（review_images_insert + storage）
-- □ 管理画面でスポット一覧が表示される
-- □ 管理画面でユーザー一覧が表示される
-- □ 事業者割り当てが保存・削除できる
-- □ お気に入り追加・削除ができる
-- □ LINE Bot から通報が送信できる
-- □ イベント一覧が表示される（cancelled 除外を確認）
-- □ Security Advisor を再実行して警告ゼロを確認
-- ============================================================
