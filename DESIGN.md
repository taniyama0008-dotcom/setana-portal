# DESIGN.md — せたなの暮らし・食・自然（setana-portal）

> このファイルはAIエージェントが正確な日本語UIを生成するためのデザイン仕様書です。
> セクションヘッダーは英語、値の説明は日本語で記述しています。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 写真が主役の静かで温かいメディアサイト。装飾は最小限に抑え、せたな町の自然・食・暮らしの写真が語るデザイン
- **密度**: ゆったりとしたメディア型。大きな写真、広い余白、ゆるやかなスクロール体験
- **キーワード**: 静か、温かい、自然体、余白、写真が主役
- **参考サイト**:
  - https://knot-to-knot.co.jp/ — 静かな余白感、情景写真中心、小さめフォント＋ゆったり行間
  - https://suu-haa.jp/ — 「暮らす・働く・つながる」3軸構造の明快なナビゲーション、手描きイラストの温かみ
  - https://urahoro-terroir.com/ — 白ベース＋大きな写真＋親しみやすさ、地域の人が主役
- **世界観**: せたな町の日本海、狩場山、漁港、牧場、夕日。都会的な洗練ではなく「ここで暮らしている人の目線」を大切にする

---

## 2. Color Palette & Roles

### Accent（3色のアクセント ― せたなの風景から抽出）

- **Ocean（海）** (`#5b7e95`): 日本海のブルーグレー。リンク、ナビゲーションのアクティブ状態
- **Ocean Dark** (`#3d5a6e`): ホバー時のOcean
- **Forest（森）** (`#6b8f71`): 狩場山のモスグリーン。「自然」セクションのアクセント、タグ
- **Forest Dark** (`#4a6b50`): ホバー時のForest
- **Sunset（夕日）** (`#c47e4f`): せたなの夕日のウォームアンバー。「食」セクションのアクセント、CTAボタン
- **Sunset Dark** (`#a5663a`): ホバー時のSunset

### Section Colors（セクション識別）

- **暮らし**: Ocean `#5b7e95`
- **食**: Sunset `#c47e4f`
- **自然**: Forest `#6b8f71`

### Semantic（意味的な色）

- **Danger** (`#d94f4f`): エラー、削除
- **Warning** (`#d4a843`): 警告
- **Success** (`#5a9e6f`): 成功、完了

### Neutral（ニュートラル）

- **Text Primary** (`#1a1a1a`): 本文テキスト。純黒ではなくわずかに柔らかい黒
- **Text Secondary** (`#5c5c5c`): 補足テキスト、日付、ラベル
- **Text Muted** (`#8a8a8a`): さらに薄い補足
- **Border** (`#e0e0e0`): 区切り線
- **Border Light** (`#efefef`): 薄い区切り線
- **Background** (`#ffffff`): ページ背景
- **Background Warm** (`#faf8f5`): セクション背景。わずかに温かみのあるオフホワイト
- **Surface** (`#ffffff`): カード等の面

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: Noto Sans JP（ウェイト: 300, 400, 500, 700）
- **明朝体**: 使用なし（将来的に記事の引用等で検討）

### 3.2 欧文フォント

- **サンセリフ**: Inter（ウェイト: 400, 500, 600）
- **等幅**: SFMono-Regular, Consolas, monospace

### 3.3 font-family 指定

```css
/* 本文 */
font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;

/* 欧文が目立つ箇所（ナビ英字ラベル等） */
font-family: "Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;

/* 等幅 */
font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
```

フォールバックの考え方:

- 日本語の可読性を最優先するため、和文フォントを先に指定
- Noto Sans JP の欧文グリフも十分美しいため、本文では欧文フォントを先に置かない
- ナビゲーションの英字ラベル等、欧文が主の箇所のみ Inter を先に指定

### 3.4 文字サイズ・ウェイト階層

| Role | Font | Size | Weight | Line Height | Letter Spacing | 備考 |
|------|------|------|--------|-------------|----------------|------|
| Hero Title | Noto Sans JP | 36px (2.25rem) | 700 | 1.4 | 0.02em | トップページのヒーロー |
| Heading 1 | Noto Sans JP | 28px (1.75rem) | 700 | 1.4 | 0.02em | セクション見出し |
| Heading 2 | Noto Sans JP | 22px (1.375rem) | 600 | 1.5 | 0.03em | サブ見出し |
| Heading 3 | Noto Sans JP | 18px (1.125rem) | 600 | 1.5 | 0.03em | 小見出し |
| Body | Noto Sans JP | 15px (0.9375rem) | 400 | 1.9 | 0.06em | 本文 |
| Body Small | Noto Sans JP | 14px (0.875rem) | 400 | 1.8 | 0.05em | 記事カード等 |
| Caption | Noto Sans JP | 12px (0.75rem) | 400 | 1.7 | 0.04em | 日付、カテゴリ |
| Nav Label | Inter / Noto Sans JP | 13px (0.8125rem) | 500 | 1.4 | 0.08em | ナビゲーション |

### 3.5 行間・字間

- 本文の行間 (line-height): 1.9（knotのような静かで読みやすいリズム）
- 見出しの行間: 1.4〜1.5
- 本文の字間 (letter-spacing): 0.06em
- 見出しの字間: 0.02〜0.03em
- ナビの字間: 0.08em（英字ラベルにトラッキングを効かせる）

ガイドライン:

- 本文の line-height 1.9 は knotの空気感を再現するために意図的に広め
- letter-spacing 0.06em で日本語テキストにわずかな余裕を持たせる
- 見出しは締めて（0.02em）、本文はゆるめる（0.06em）メリハリ

### 3.6 禁則処理・改行ルール

```css
word-break: keep-all;
overflow-wrap: break-word;
line-break: strict;
```

禁則対象:

- 行頭禁止: ）」』】〕〉》」】、。，．・：；？！
- 行末禁止: （「『【〔〈《「【

### 3.7 OpenType 機能

```css
/* 見出し・ナビゲーション */
font-feature-settings: "palt" 1, "kern" 1;

/* 本文 */
font-feature-settings: "kern" 1;
```

- `palt`: 見出しとナビゲーションにのみ適用。プロポーショナル字詰めで洗練された印象
- `kern`: 全体に適用。和欧混植時のカーニング
- 本文には `palt` を適用しない（可読性優先）

### 3.8 縦書き

該当なし

---

## 4. Component Stylings

### Buttons

**Primary (CTA)**

- Background: `#c47e4f`（Sunset）
- Text: `#ffffff`
- Padding: 14px 32px
- Border Radius: 8px
- Font Size: 15px
- Font Weight: 600
- Hover: `#a5663a`（Sunset Dark）
- min-height: 48px

**Secondary (Outline)**

- Background: transparent
- Text: `#1a1a1a`
- Border: 1px solid `#e0e0e0`
- Padding: 12px 24px
- Border Radius: 8px
- Hover Background: `#faf8f5`

**Section Accent（各セクション用）**

- 暮らしセクション: Background `#5b7e95`, Hover `#3d5a6e`
- 食セクション: Background `#c47e4f`, Hover `#a5663a`
- 自然セクション: Background `#6b8f71`, Hover `#4a6b50`

### Inputs

- Background: `#ffffff`
- Border: 1px solid `#e0e0e0`
- Border (focus): 1px solid `#5b7e95`（Ocean）
- Border Radius: 6px
- Padding: 12px 16px
- Font Size: 15px
- min-height: 48px

### Cards

- Background: `#ffffff`
- Border: none
- Border Radius: 8px
- Padding: 0（写真が端まで）
- Shadow: `0 1px 4px rgba(0,0,0,0.06)`
- Hover Shadow: `0 4px 16px rgba(0,0,0,0.1)`
- 写真部分は角丸の上半分を占める
- テキスト部分: padding 20px 20px 24px

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Tailwind |
|-------|-------|---------|
| XS | 4px | p-1 |
| S | 8px | p-2 |
| M | 16px | p-4 |
| L | 24px | p-6 |
| XL | 32px | p-8 |
| 2XL | 48px | p-12 |
| 3XL | 64px | p-16 |
| 4XL | 96px | p-24 |
| 5XL | 128px | p-32 |

### Container

- Max Width（コンテンツ）: 860px（記事本文は 680px）
- Max Width（ワイド）: 1120px
- Padding (horizontal): 20px (mobile) / 32px (desktop)

### Grid

- 記事カード: 1列 (mobile) → 2列 (tablet) → 3列 (desktop)
- Gutter: 24px (mobile) / 32px (desktop)

### 写真の扱い

- ヒーロー: 100vw × 70vh（フルブリード、object-fit: cover）
- 記事サムネイル: アスペクト比 3:2
- スポット個別ページ: メイン写真はフルブリード、ギャラリーは横スクロール
- 全写真に必ず alt 属性

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | 基本状態。フラットが基本 |
| 1 | `0 1px 4px rgba(0,0,0,0.06)` | カード、セクション |
| 2 | `0 4px 16px rgba(0,0,0,0.1)` | カードホバー、ドロップダウン |
| 3 | `0 8px 32px rgba(0,0,0,0.12)` | モーダル、フローティング |

影は控えめに。フラットな表現を基本とし、ホバー時のみ軽い浮遊感を出す

---

## 7. Do's and Don'ts

### Do（推奨）

- 写真を大きく使う。ヒーローはフルブリード、記事カードのサムネイルも大きめに
- 余白を十分に取る。セクション間は 96px〜128px
- テキスト色は `#1a1a1a`（純黒を避ける）
- 「暮らし」「食」「自然」の3セクションを色で識別できるようにする
- 本文の max-width は 680px に制限して可読性を確保
- 写真のキャプションは Caption スタイル（12px, `#8a8a8a`）で控えめに
- Noto Sans JP のウェイト300（Light）を大きな見出しで使うのは可
- フォントは必ずフォールバックチェーンを指定する
- 参考サイト（knot, SuuHaa, 浦幌テロワール）のトーンに近づける

### Don't（禁止）

- 派手なアニメーション、パララックスを使わない
- 彩度の高い原色を使わない。すべての色は自然界から抽出したミュートトーン
- テキストに純黒 `#000000` を使わない
- カードに強い影を付けない
- グラデーション背景を使わない
- 写真の上にオーバーレイなしでテキストを置かない（暗めのオーバーレイ必須）
- ファミマッチのオレンジ `#f97316` を使わない（別プロジェクト）
- SaaS的なUIデザイン（角張ったカード、情報密度の高いダッシュボード型）にしない
- `palt` を本文テキストに適用しない

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Tailwind | 説明 |
|------|-------|---------|------|
| Mobile | < 640px | default | 1カラム、写真フルブリード |
| Tablet | ≥ 640px | sm: | 2カラムグリッド |
| Desktop | ≥ 1024px | lg: | 3カラムグリッド、サイドナビ表示 |
| Wide | ≥ 1280px | xl: | コンテンツ幅1120px |

### タッチターゲット

- 最小サイズ: 44px × 44px（WCAG基準）
- ナビゲーション項目: 48px 以上

### フォントサイズの調整

- モバイル: Body 15px, H1 24px, Hero 28px
- デスクトップ: Body 15px, H1 28px, Hero 36px

---

## 9. Agent Prompt Guide

### クイックリファレンス

```
Ocean: #5b7e95（海・暮らし）
Forest: #6b8f71（森・自然）
Sunset: #c47e4f（夕日・食・CTA）
Text: #1a1a1a
Background: #ffffff
Warm BG: #faf8f5
Font: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif
Body: 15px / weight 400 / line-height 1.9 / letter-spacing 0.06em
Content Width: 860px (article body: 680px)
Card Radius: 8px
Button Radius: 8px
```

### ページ生成時のルール

1. DESIGN.md を読み、カラーとタイポグラフィを厳守する
2. 写真はフルブリードまたは大きなサムネイルで配置する
3. セクション（暮らし/食/自然）に応じたアクセントカラーを使い分ける
4. Tailwind CSS を使用する（Next.js + App Router）
5. 画像には必ず `width`, `height`, `alt` を明示する（Next/Image使用）
6. 構造化データ（JSON-LD）を各ページに埋め込む
7. ダークモードは対応しない
8. 参考サイト knot (https://knot-to-knot.co.jp/) のような静かで余白のあるレイアウトを目指す
