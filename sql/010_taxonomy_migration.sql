-- ============================================================
-- 010: taxonomy migration
-- spots テーブルを新分類体系（travel / life / connect）に移行
-- 実行順序を守ること。本番実行前に必ずバックアップ取得。
-- ============================================================

-- ============================================================
-- Step 1: 新カラム追加
-- ============================================================
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS primary_category TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sub_categories   TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS spot_order       JSONB  NOT NULL DEFAULT '{}';

-- ============================================================
-- Step 2: area を英字キーに正規化
--   '瀬棚区' → 'setana'  /  '北檜山区' → 'kitahiyama'  /  '大成区' → 'taisei'
-- ============================================================
UPDATE spots SET area = CASE area
  WHEN '瀬棚区'  THEN 'setana'
  WHEN '北檜山区' THEN 'kitahiyama'
  WHEN '大成区'  THEN 'taisei'
  ELSE NULL
END;

-- area の CHECK 制約を更新
ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_area_check;
ALTER TABLE spots ADD CONSTRAINT spots_area_check
  CHECK (area IS NULL OR area IN ('setana', 'kitahiyama', 'taisei'));

-- ============================================================
-- Step 3: category → primary_category のデータ移行
--   ※ 下記マッピングで判定できないスポットは末尾のリスト参照
-- ============================================================
UPDATE spots SET primary_category = CASE
  -- 温泉系
  WHEN category IN ('onsen', '温泉', '日帰り温泉', '温泉施設') THEN 'onsen'

  -- 宿泊系
  WHEN category IN ('stay', 'accommodation', 'hotel',
                    '旅館', 'minshuku', '民宿', 'キャンプ', 'campground', '宿泊')
    THEN 'stay'

  -- グルメ系
  WHEN category IN ('gourmet', 'shop')          THEN 'gourmet'  -- shop は要確認

  -- 自然・アクティビティ系
  WHEN category IN ('nature', 'activity')       THEN 'nature'

  -- 釣り系（fishing_shop も fishing に統合。要確認）
  WHEN category IN ('fishing', 'fishing_shop')  THEN 'fishing'

  -- 公共施設（要確認 — 適切なカテゴリに個別移動を推奨）
  WHEN category IN ('facility')                 THEN 'living'

  -- しごと系（kurashi section 内）
  WHEN category IN ('work', 'job')              THEN 'work'

  -- 移住系（kurashi section 内）
  WHEN category IN ('migration', 'iju')         THEN 'migration'

  -- セクション別フォールバック
  WHEN section = 'shoku'   THEN 'gourmet'
  WHEN section = 'shizen'  THEN 'nature'
  WHEN section = 'kurashi' THEN 'living'

  ELSE 'nature'  -- 不明なものは nature（要確認リストに記載）
END
WHERE primary_category = '';

-- ============================================================
-- Step 4: section を新分類に移行
--   shoku → travel  /  shizen → travel  /  kurashi → life
-- ============================================================
UPDATE spots SET section = CASE section
  WHEN 'shoku'   THEN 'travel'
  WHEN 'shizen'  THEN 'travel'
  WHEN 'kurashi' THEN 'life'
  -- 以下は再実行時に既に移行済みの場合（冪等性）
  WHEN 'travel'  THEN 'travel'
  WHEN 'life'    THEN 'life'
  WHEN 'connect' THEN 'connect'
  ELSE 'travel'
END;

-- ============================================================
-- Step 5: section の CHECK 制約を更新
-- ============================================================
ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_section_check;
ALTER TABLE spots ADD CONSTRAINT spots_section_check
  CHECK (section IN ('travel', 'life', 'connect'));

-- ============================================================
-- Step 6: インデックス更新
-- ============================================================
DROP INDEX IF EXISTS idx_spots_section;
DROP INDEX IF EXISTS idx_spots_category;

CREATE INDEX IF NOT EXISTS idx_spots_section          ON spots (section);
CREATE INDEX IF NOT EXISTS idx_spots_primary_category ON spots (primary_category);
CREATE INDEX IF NOT EXISTS idx_spots_sub_categories   ON spots USING GIN (sub_categories);

-- ============================================================
-- 移行確認クエリ（実行後に確認してください）
-- ============================================================
-- SELECT section, primary_category, category, name
-- FROM spots
-- ORDER BY section, primary_category;

-- ============================================================
-- 要確認スポットリスト（primary_category が推定マッピングのもの）
-- ============================================================
-- SELECT id, name, category AS old_category, primary_category, section
-- FROM spots
-- WHERE category IN ('shop', 'facility', 'fishing_shop')
--    OR (section = 'shizen' AND category NOT IN (
--          'onsen', '温泉', '日帰り温泉', '温泉施設',
--          'stay', 'accommodation', 'hotel', '旅館', 'minshuku', '民宿', 'キャンプ', 'campground', '宿泊',
--          'nature', 'activity', 'fishing', 'fishing_shop', 'gourmet'
--        ))
-- ORDER BY section, category;
