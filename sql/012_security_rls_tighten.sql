-- ============================================================
-- 012: Security Advisor 対策 — RLS ポリシー締め直し
--
-- ⚠️  このファイルは本番 DB 適用前に必ずレビューすること
--
-- 対象の警告カテゴリ:
--   Cat-1: RLS Policy Always True (USING(true) / WITH CHECK(true)) ~20件
--   Cat-4: Function Search Path Mutable (generate_report_number, update_updated_at)
--
-- Cat-2 (Storage Listing) は手順コメントを末尾に記載
-- Cat-3 (Leaked Password) はダッシュボード手動対応
--
-- 前提:
--   - supabaseAdmin (service_role) が使う操作は RLS をバイパスするため
--     INSERT/UPDATE/DELETE ポリシーは「authenticated クライアントからの
--     直接操作」を制御するものとして設計している
--   - LINE 認証ユーザーは supabase_auth_id を持たないため auth.uid() = NULL
--     → 全操作を service_role 経由で行っており、client-side RLS の対象外
-- ============================================================


-- ============================================================
-- ヘルパー関数
-- SECURITY DEFINER + SET search_path で RLS 再帰と検索パス攻撃を防ぐ
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM users WHERE supabase_auth_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM users WHERE supabase_auth_id = auth.uid() LIMIT 1
$$;


-- ============================================================
-- users
-- 問題: USING(true) で全ユーザーデータを誰でも読み書き可能
-- ============================================================
DROP POLICY IF EXISTS "users_self_read"   ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;
DROP POLICY IF EXISTS "users_line_insert" ON users;

-- SELECT: 本人のみ、admin は全件
CREATE POLICY "users_select" ON users
  FOR SELECT TO authenticated
  USING (
    supabase_auth_id = auth.uid()
    OR get_my_role() = 'admin'
  );

-- UPDATE: 本人のみ、admin は全件
-- ⚠️ role カラムの変更制限はカラムレベルセキュリティ(CLS)または
--    サーバー側コードで制御すること（RLS では列単位制限が困難）
CREATE POLICY "users_update" ON users
  FOR UPDATE TO authenticated
  USING (
    supabase_auth_id = auth.uid()
    OR get_my_role() = 'admin'
  )
  WITH CHECK (
    supabase_auth_id = auth.uid()
    OR get_my_role() = 'admin'
  );

-- INSERT: メール認証での新規登録のみ
-- LINE Webhook は service_role で INSERT するため RLS バイパス → ここは不要だが念のため許可
CREATE POLICY "users_insert" ON users
  FOR INSERT TO authenticated
  WITH CHECK (supabase_auth_id = auth.uid());

-- DELETE: admin のみ（通常削除は service_role 経由）
CREATE POLICY "users_delete" ON users
  FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- favorites
-- 問題: USING(true) で全ユーザーのお気に入りを誰でも操作可能
-- ============================================================
DROP POLICY IF EXISTS "favorites_user_read" ON favorites;
DROP POLICY IF EXISTS "favorites_insert"    ON favorites;
DROP POLICY IF EXISTS "favorites_delete"    ON favorites;

-- SELECT: 本人のみ
CREATE POLICY "favorites_select" ON favorites
  FOR SELECT TO authenticated
  USING (user_id = get_my_user_id());

-- INSERT: 本人のレコードのみ
CREATE POLICY "favorites_insert" ON favorites
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_my_user_id());

-- DELETE: 本人のレコードのみ
CREATE POLICY "favorites_delete" ON favorites
  FOR DELETE TO authenticated
  USING (user_id = get_my_user_id());


-- ============================================================
-- reviews
-- 問題: INSERT が WITH CHECK(true) かつ anon に開放されている
-- ============================================================
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
-- reviews_public_read は USING(status = 'public') で正しい → 変更なし

-- INSERT: authenticated のみ（ゲスト投稿不可に変更）
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: 投稿者本人 or admin
CREATE POLICY "reviews_update" ON reviews
  FOR UPDATE TO authenticated
  USING (
    user_id = get_my_user_id()
    OR get_my_role() = 'admin'
  )
  WITH CHECK (
    user_id = get_my_user_id()
    OR get_my_role() = 'admin'
  );

-- DELETE: 投稿者本人 or admin
CREATE POLICY "reviews_delete" ON reviews
  FOR DELETE TO authenticated
  USING (
    user_id = get_my_user_id()
    OR get_my_role() = 'admin'
  );


-- ============================================================
-- review_images
-- 問題: INSERT が WITH CHECK(true) かつ anon に開放されている
-- ============================================================
DROP POLICY IF EXISTS "review_images_insert" ON review_images;
-- review_images_public_read は EXISTS(status='public') で正しい → 変更なし

-- INSERT: 自分が書いた口コミの画像のみ追加可能
-- ⚠️ 口コミ送信フローがサーバーアクション経由の場合はこのポリシー不要
--    クライアントから直接 insert する場合は必要
CREATE POLICY "review_images_insert" ON review_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id = review_id
        AND reviews.user_id = get_my_user_id()
    )
  );


-- ============================================================
-- business_spots
-- 問題: SELECT USING(true) + ALL USING(true) で全件操作可能
-- ============================================================
DROP POLICY IF EXISTS "business_spots_read"            ON business_spots;
DROP POLICY IF EXISTS "Admin can manage business_spots" ON business_spots;

-- SELECT: 本人(business)のみ or admin
CREATE POLICY "business_spots_select" ON business_spots
  FOR SELECT TO authenticated
  USING (
    user_id = get_my_user_id()
    OR get_my_role() = 'admin'
  );

-- INSERT/DELETE: admin のみ（管理画面は service_role 経由のため事実上不要だが明示）
CREATE POLICY "business_spots_admin_insert" ON business_spots
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "business_spots_admin_delete" ON business_spots
  FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- coin_transactions
-- 問題: USING(true) WITH CHECK(true) で全件操作可能
-- ============================================================
DROP POLICY IF EXISTS "coin_tx_user_read"              ON coin_transactions;
DROP POLICY IF EXISTS "Allow all on coin_transactions" ON coin_transactions;

-- SELECT: 本人のみ or admin
CREATE POLICY "coin_tx_select" ON coin_transactions
  FOR SELECT TO authenticated
  USING (
    user_id = get_my_user_id()
    OR get_my_role() = 'admin'
  );

-- INSERT/UPDATE/DELETE: service_role のみ（ポリシーなし = authenticated クライアントから不可）


-- ============================================================
-- reports
-- 問題: USING(true) WITH CHECK(true) の "Allow all" が全操作を開放
-- ============================================================
DROP POLICY IF EXISTS "Allow all on reports" ON reports;
-- reports_public_read (is_public = true) は正しい → 変更なし

-- SELECT: admin は全件（公開分は reports_public_read と OR で合算される）
CREATE POLICY "reports_admin_select" ON reports
  FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

-- INSERT: anon + authenticated（LINE Bot / web から通報を受け付ける）
CREATE POLICY "reports_insert" ON reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: admin のみ（ステータス変更・公開フラグ操作）
CREATE POLICY "reports_admin_update" ON reports
  FOR UPDATE TO authenticated
  USING  (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- DELETE: admin のみ
CREATE POLICY "reports_admin_delete" ON reports
  FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- events
-- 問題: USING(TRUE) で全イベントが無条件公開
-- ============================================================
DROP POLICY IF EXISTS "events_anon_read" ON events;

-- SELECT: キャンセル以外のイベントを公開
CREATE POLICY "events_public_read" ON events
  FOR SELECT TO anon, authenticated
  USING (status <> 'cancelled');

-- INSERT/UPDATE/DELETE: admin のみ（管理は service_role 経由が基本）
CREATE POLICY "events_admin_insert" ON events
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "events_admin_update" ON events
  FOR UPDATE TO authenticated
  USING  (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "events_admin_delete" ON events
  FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- カテゴリ4: Function Search Path Mutable
-- 2つの関数に SET search_path = public, pg_temp を追加
-- ============================================================

-- generate_report_number（006 の最新版を search_path 付きで再作成）
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

-- update_updated_at（DB 上に存在する想定。なければ CREATE で作成）
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
-- カテゴリ2: Storage バケットリスト制限
--
-- ⚠️ ストレージポリシーの名前は Supabase Dashboard で確認してから
--    DROP POLICY を実行すること。名前が違うとエラーになる。
--
-- 以下のコマンドで現在のポリシー名を確認:
--   SELECT policyname, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects';
--
-- 方針:
--   - 公開 CDN URL（https://*.supabase.co/storage/v1/object/public/...）は
--     RLS を経由しないため、画像の表示には影響しない
--   - Supabase client の .list() API を anon では呼べないよう制限する
--   - admin（service_role）は RLS バイパスのため変更不要
--
-- 実行例（ポリシー名を確認後に実行）:
--
-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;  -- 実際の名前に置き換える
--
-- CREATE POLICY "spots_objects_select" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (
--     bucket_id = 'spots'
--     AND get_my_role() IN ('admin', 'business')
--   );
--
-- CREATE POLICY "reviews_objects_select" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (
--     bucket_id = 'reviews'
--     AND (
--       get_my_role() = 'admin'
--       OR name ~ '\.[a-zA-Z0-9]+$'  -- ファイル名を持つオブジェクトのみ許可
--     )
--   );
--
-- articles / events / reports バケットは admin 専用:
-- CREATE POLICY "articles_objects_select" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'articles' AND get_my_role() = 'admin');
--
-- CREATE POLICY "events_objects_select" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'events'   AND get_my_role() = 'admin');
--
-- CREATE POLICY "reports_objects_select" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'reports'  AND get_my_role() = 'admin');
--
-- ============================================================


-- ============================================================
-- カテゴリ3: Leaked Password Protection
-- ダッシュボードで手動対応:
--   Authentication → Sign In / Up → Password Protection → ON
-- ============================================================
