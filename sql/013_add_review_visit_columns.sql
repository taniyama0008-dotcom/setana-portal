-- reviews テーブルに訪問時期カラムを追加
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS visit_year  integer,
  ADD COLUMN IF NOT EXISTS visit_month integer CHECK (visit_month BETWEEN 1 AND 12);
