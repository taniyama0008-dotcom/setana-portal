# CLAUDE.md — せたなの暮らし・食・自然 ポータルサイト

## プロジェクト概要
せたな町（北海道久遠郡）の「暮らし・食・自然」を伝える地域総合メディア。
観光ガイドではなく、せたな町で生きることのすべてが集まるプラットフォーム。

## 技術スタック
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)
- Vercel (hosting)
- Mapbox or Leaflet (地図)

## ディレクトリ構造

```
src/
  app/
    page.tsx                    # トップページ
    kurashi/                    # 暮らしセクション
      page.tsx
    shoku/                      # 食セクション
      page.tsx
    shizen/                     # 自然セクション
      page.tsx
    spot/[slug]/page.tsx        # スポット個別ページ
    article/[slug]/page.tsx     # 記事個別ページ
    layout.tsx
  components/
    layout/
      Header.tsx
      Footer.tsx
      Navigation.tsx
    ui/
      Button.tsx
      Card.tsx
      SectionHeading.tsx
    spot/
      SpotCard.tsx
      SpotDetail.tsx
      BasicInfoTable.tsx
      PhotoGallery.tsx
    article/
      ArticleCard.tsx
  lib/
    supabase.ts
    types.ts
  styles/
    globals.css
```

## デザインルール
- 必ず DESIGN.md を読んでからUIを生成すること
- 3セクション（暮らし/食/自然）ごとにアクセントカラーを使い分ける
- 写真を大きく扱い、余白を広く取る
- 本文の max-width は 680px
- セクション間の余白は 96px 以上

## Supabase テーブル（MVP用・最小構成）
- `users`: id, email, nickname, avatar_url, role, created_at
- `spots`: id, name, slug, section, category, area, description, address, phone, business_hours, holidays, latitude, longitude, images, status, created_at, updated_at
- `articles`: id, title, slug, section, category, content, cover_image, author_id, status, created_at, updated_at

## SEO要件
- 全ページに構造化データ（JSON-LD）
- OGP / Twitter Card
- XMLサイトマップ自動生成
- パンくずリスト（BreadcrumbList schema）
- スポットページ: TouristAttraction / Restaurant schema
- Next/Image で width, height, alt 必須
- SSG (generateStaticParams) を基本とする

## Git
- mainブランチにコミット
- コミットメッセージは日本語可
