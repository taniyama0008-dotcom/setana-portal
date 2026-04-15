-- ============================================================
-- 008: articles テーブル
-- 依存: users (001)
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  section     TEXT        NOT NULL CHECK (section IN ('kurashi', 'shoku', 'shizen')),
  category    TEXT        CHECK (category IN (
                'story', 'job_feature', 'iju', 'course',
                'special', 'producer', 'recipe', 'guide'
              )),
  content     TEXT,
  excerpt     TEXT,
  cover_image TEXT,
  author_name TEXT,
  status      TEXT        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('public', 'draft')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 公開記事は誰でも読める
CREATE POLICY "articles_public_read" ON articles
  FOR SELECT TO anon, authenticated
  USING (status = 'public');

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug       ON articles (slug);
CREATE INDEX        IF NOT EXISTS idx_articles_status     ON articles (status);
CREATE INDEX        IF NOT EXISTS idx_articles_section    ON articles (section);
CREATE INDEX        IF NOT EXISTS idx_articles_created_at ON articles (created_at DESC);
