-- Migration: spots テーブルに FAQ と動画の JSONB カラムを追加
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS faq    JSONB,
  ADD COLUMN IF NOT EXISTS videos JSONB;

-- faq 構造例:
-- [{"question": "日帰り入浴できますか？", "answer": "はい、大人450円で..."}]
--
-- videos 構造例:
-- [{"platform": "youtube", "url": "https://youtube.com/watch?v=...", "title": "調理風景"}]
