-- ============================================================
-- 010_fix: taxonomy migration — 修正版
-- 既存の area 制約を一時的に外し、全更新を完了させてから再追加
-- ※ 010_taxonomy_migration.sql を実行済みで途中エラーになった場合に使用
-- ============================================================

BEGIN;

-- ── 既存の CHECK 制約を全て削除（クリーンスタート）──────────
ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_area_check;
ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_section_check;

-- ── Step 1: 新カラム追加（べき等） ─────────────────────────
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS primary_category TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sub_categories   TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS spot_order       JSONB  NOT NULL DEFAULT '{}';

-- ── Step 2: area を英字キーに正規化 ─────────────────────────
-- 既にそれを持つ行（'setana' 等）はスキップ、まだ日本語の行のみ変換
UPDATE spots SET area = CASE area
  WHEN '瀬棚区'  THEN 'setana'
  WHEN '北檜山区' THEN 'kitahiyama'
  WHEN '大成区'  THEN 'taisei'
  -- 既に英字キーの行（べき等）
  WHEN 'setana'     THEN 'setana'
  WHEN 'kitahiyama' THEN 'kitahiyama'
  WHEN 'taisei'     THEN 'taisei'
  ELSE NULL  -- '' や未知の値は NULL へ
END;

-- ── Step 3: primary_category を設定（未設定行のみ） ─────────
UPDATE spots SET primary_category = CASE
  -- 温泉系
  WHEN category IN ('onsen', '温泉', '日帰り温泉', '温泉施設') THEN 'onsen'

  -- 宿泊系（accommodation が正解なので stay にマッピング）
  WHEN category IN ('stay', 'accommodation', 'hotel',
                    '旅館', 'minshuku', '民宿', 'キャンプ', 'campground', '宿泊')
    THEN 'stay'

  -- グルメ・物販系
  WHEN category IN ('gourmet', 'shop') THEN 'gourmet'

  -- 自然・アクティビティ系
  WHEN category IN ('nature', 'activity') THEN 'nature'

  -- 釣り系
  WHEN category IN ('fishing', 'fishing_shop') THEN 'fishing'

  -- 公共施設（life/living へ）
  WHEN category IN ('facility') THEN 'living'

  -- しごと系
  WHEN category IN ('work', 'job') THEN 'work'

  -- 移住系
  WHEN category IN ('migration', 'iju') THEN 'migration'

  -- セクション別フォールバック
  WHEN section IN ('shoku', 'travel') THEN 'gourmet'
  WHEN section = 'shizen' THEN 'nature'
  WHEN section IN ('kurashi', 'life') THEN 'living'
  WHEN section = 'connect' THEN 'furusato'

  ELSE 'nature'
END
WHERE primary_category = '';

-- ── Step 4: section を新分類に移行（べき等） ────────────────
UPDATE spots SET section = CASE section
  WHEN 'shoku'   THEN 'travel'
  WHEN 'shizen'  THEN 'travel'
  WHEN 'kurashi' THEN 'life'
  -- 既に新分類の場合はそのまま
  WHEN 'travel'  THEN 'travel'
  WHEN 'life'    THEN 'life'
  WHEN 'connect' THEN 'connect'
  ELSE 'travel'
END;

-- ── Step 5: CHECK 制約を新定義で追加 ────────────────────────
ALTER TABLE spots ADD CONSTRAINT spots_area_check
  CHECK (area IS NULL OR area IN ('setana', 'kitahiyama', 'taisei'));

ALTER TABLE spots ADD CONSTRAINT spots_section_check
  CHECK (section IN ('travel', 'life', 'connect'));

-- ── Step 6: インデックス更新 ─────────────────────────────────
DROP INDEX IF EXISTS idx_spots_section;
DROP INDEX IF EXISTS idx_spots_category;

CREATE INDEX IF NOT EXISTS idx_spots_section          ON spots (section);
CREATE INDEX IF NOT EXISTS idx_spots_primary_category ON spots (primary_category);
CREATE INDEX IF NOT EXISTS idx_spots_sub_categories   ON spots USING GIN (sub_categories);

COMMIT;

-- ── 確認クエリ ───────────────────────────────────────────────
-- 以下を別途実行して移行結果を確認してください:
--
-- SELECT id, name, section, primary_category, category AS old_category, area
-- FROM spots
-- ORDER BY section, primary_category;
--
-- ── 要確認スポット（仮マッピングされたもの） ─────────────────
-- SELECT id, name, category AS old_category, primary_category, section, area
-- FROM spots
-- WHERE category IN ('shop', 'facility', 'fishing_shop')
--    OR primary_category = ''
-- ORDER BY category;
