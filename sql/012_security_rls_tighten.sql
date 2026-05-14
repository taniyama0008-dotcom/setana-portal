-- ============================================================
-- 012: Security Advisor 対策 — RLS ポリシー締め直し（確定版）
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
--   service_role しか使わないテーブル → ポリシーを削除
--   (ポリシーなし = anon/authenticated クライアントから操作不可)
--
-- 対象警告カテゴリ:
--   Cat-1: RLS Policy Always True   ~20件
--   Cat-2: Storage Listing 対策（INSERT 許可 + SELECT 制限コメント）
--   Cat-4: Function Search Path Mutable   2件
--   Cat-3: Password Protection → Dashboard 手動対応（このファイル対象外）
-- ============================================================


-- ============================================================
-- users
-- 対処: 既存の USING(true) / WITH CHECK(true) ポリシーをすべて削除
-- 理由: 全操作が supabaseAdmin (service_role) 経由。
--   - ログイン: api/auth/line/route.ts → supabaseAdmin に移行済み（別PR）
--   - プロフィール更新: actions/user.ts → 元から supabaseAdmin
-- ============================================================
DROP POLICY IF EXISTS "users_self_read"   ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;
DROP POLICY IF EXISTS "users_line_insert" ON users;
-- ポリシーなし = service_role 以外からのアクセス不可 ✅


-- ============================================================
-- favorites
-- 対処: 既存の USING(true) / WITH CHECK(true) ポリシーをすべて削除
-- 理由: actions/favorite.ts → supabaseAdmin に移行済み（別PR）
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
-- 対処: 旧 USING(true) / WITH CHECK(true) ポリシーを削除
-- 理由: actions/review.ts を supabaseAdmin に移行済み。
--       anon クライアントから直接 INSERT する経路なし。
-- reviews_public_read (USING(status = 'public')) は正しい → 変更なし
-- ============================================================
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
-- ポリシーなし = anon/authenticated クライアントから INSERT 不可 ✅
-- (service_role は RLS バイパス)


-- ============================================================
-- review_images
-- 対処: 旧 WITH CHECK(true) ポリシーを削除
-- 理由: actions/review.ts を supabaseAdmin に移行済み。
-- review_images_public_read (EXISTS(status='public')) は正しい → 変更なし
-- ============================================================
DROP POLICY IF EXISTS "review_images_insert" ON review_images;
-- ポリシーなし = anon/authenticated クライアントから INSERT 不可 ✅


-- ============================================================
-- reports
-- 対処: "Allow all on reports" を削除し、INSERT のみ anon 許可
-- 理由: LINE Bot / Web 通報フォームは anon から INSERT する可能性がある。
--       UPDATE/DELETE は管理画面(service_role)のみ。
-- reports_public_read (USING(is_public = true)) は正しい → 変更なし
-- ============================================================
DROP POLICY IF EXISTS "Allow all on reports" ON reports;

-- INSERT: anon + authenticated 許可
-- category / report_type の値は DB の CHECK 制約で保護されている
CREATE POLICY "reports_insert" ON reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- UPDATE / DELETE: ポリシーなし（service_role のみ）


-- ============================================================
-- events
-- 対処: USING(TRUE) → キャンセル済みを除外する条件に変更
-- ============================================================
DROP POLICY IF EXISTS "events_anon_read" ON events;

CREATE POLICY "events_public_read" ON events
  FOR SELECT TO anon, authenticated
  USING (status <> 'cancelled');

-- INSERT / UPDATE / DELETE: ポリシーなし（service_role のみ）


-- ============================================================
-- Cat-4: Function Search Path Mutable の修正
-- generate_report_number / update_updated_at に SET search_path 追加
-- ============================================================

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
-- Cat-2: Storage バケット設定
--
-- 【バケット共通制限】
--   file_size_limit: 10MB
--   allowed_mime_types: jpeg / png / webp / heic のみ
-- ============================================================
UPDATE storage.buckets
SET
  file_size_limit      = 10485760,
  allowed_mime_types   = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
WHERE id IN ('reviews', 'events', 'articles', 'spots', 'reports');


-- ============================================================
-- Cat-2: Storage 既存ポリシー全廃（23件）
--
-- 確認済み事実:
--   - 全5バケット public = true
--   - getPublicUrl() による URL 直アクセスは RLS を経由しない
--     → SELECT ポリシー全 DROP でも画像表示は壊れない
--   - storage.list() 呼び出し箇所はコードベースにゼロ
--     → SELECT ポリシーを残す理由なし（残すと Cat-2 警告が残る）
--   - UPDATE/DELETE はポリシーなし → service_role 専用
-- ============================================================

-- DELETE (5)
DROP POLICY IF EXISTS "Allow delete from events"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete articles" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete reports"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete reviews"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete spots"    ON storage.objects;

-- INSERT (7)
DROP POLICY IF EXISTS "Allow public upload to events"  ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to reviews" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to spots"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload articles"     ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload reports"      ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload reviews"      ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload spots"        ON storage.objects;

-- SELECT (7) — public bucket のため全 DROP。URL 直アクセスは引き続き有効
DROP POLICY IF EXISTS "Allow public read from events"  ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from reviews" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from spots"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read articles"       ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read reports"        ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read reviews"        ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read spots"          ON storage.objects;

-- UPDATE (4)
DROP POLICY IF EXISTS "Anyone can update articles" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update reports"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update reviews"  ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update spots"    ON storage.objects;


-- ============================================================
-- Cat-2: Storage アップロードポリシー（INSERT）
--
-- 【方針A: anon upload 許可】
--   auth.uid() が常に NULL のため supabase ネイティブ RLS で
--   admin 判定が不可。EventForm / ArticleEditor が anon クライアントから
--   直接 upload しているため、anon を許可する。
--   ⚠️ TODO: EventForm.tsx / ArticleEditor.tsx を server action 経由に移行し、
--            supabaseAdmin upload に変更することで anon upload を廃止できる。
--   spots バケット: /api/admin/upload-image → supabaseAdmin → RLS バイパス済み。ポリシー不要。
--   reports バケット: service_role 経由のみ。ポリシー不要。
-- ============================================================

-- reviews バケット: 口コミ写真（ReviewForm.tsx が anon client で upload）
CREATE POLICY "reviews_objects_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'reviews');

-- events バケット: イベント画像（EventForm.tsx が anon client で upload）
-- TODO: EventForm.tsx を server action 経由に移行後、このポリシーを削除
CREATE POLICY "events_objects_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'events');

-- articles バケット: 記事カバー画像（ArticleEditor.tsx が anon client で upload）
-- TODO: ArticleEditor.tsx を server action 経由に移行後、このポリシーを削除
CREATE POLICY "articles_objects_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'articles');


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
-- □ ログイン済みで口コミを投稿できる（submitReview → supabaseAdmin）
-- □ 口コミに写真を添付して投稿できる（reviews storage upload + review_images INSERT）
-- □ 管理画面でスポット一覧が表示される
-- □ 管理画面でユーザー一覧が表示される
-- □ 事業者割り当てが保存・削除できる
-- □ お気に入り追加・削除ができる（toggleFavorite → supabaseAdmin）
-- □ LINE Bot から通報が送信できる
-- □ イベント一覧が表示される（cancelled 除外を確認）
-- □ 管理画面でイベント画像をアップロードできる（events storage）
-- □ 管理画面で記事カバー画像をアップロードできる（articles storage）
-- □ Security Advisor を再実行して警告ゼロを確認
-- ============================================================
