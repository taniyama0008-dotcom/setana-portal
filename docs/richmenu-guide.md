# LINE リッチメニュー設定ガイド

LINE Official Account Manager でリッチメニューを設定する手順と仕様。

---

## レイアウト

**2分割 または 3分割** を推奨。

### 推奨: 3分割

| 左 | 中央 | 右 |
|---|---|---|
| 通報・情報を送る | コイン残高 | サイトを開く |

---

## 各ボタンの設定

### 左: おしえる

- **テキスト**: おしえる 📢
- **サブテキスト**: 道路・お店の情報などをシェア
- **アクション種別**: ポストバック (Postback)
- **Postback data**: `report_start`
- **表示テキスト** (displayText): おしえる

### 中央: コイン残高

- **テキスト**: コイン残高
- **サブテキスト**: 貢献ポイント確認
- **アクション種別**: ポストバック (Postback)
- **Postback data**: `coin_balance`
- **表示テキスト** (displayText): コイン残高を確認

### 右: サイトを開く

- **テキスト**: せたなポータル
- **サブテキスト**: 観光・暮らし情報
- **アクション種別**: URI
- **URL**: `https://www.setana.life`

---

## 2分割の場合

### 左: おしえる
（上記と同じ）

### 右: サイトを開く
（上記と同じ）

---

## 設定手順

1. [LINE Official Account Manager](https://manager.line.biz/) にログイン
2. 対象のアカウント → 「チャットUI」→「リッチメニュー」
3. 「作成」ボタンをクリック
4. タイトル: `せたなポータル メニュー`
5. 表示期間: 常時表示
6. メニューバーテキスト: `メニュー`（または空欄）
7. テンプレートから「2分割」or「3分割」を選択
8. 各エリアにアクションを設定（上記参照）
9. デザイン画像をアップロード（推奨サイズ: 2500×1686px または 2500×843px）
10. 「保存」→「公開」

---

## リッチメニュー デザイン推奨仕様

- サイズ: 2500×1686px（全幅）または 2500×843px（ハーフ）
- 背景色: `#5b7e95`（Ocean）または `#faf8f5`
- 左ボタン: オレンジ (`#c47e4f`) で「📢 おしえる」
- 中央: コイン色 (`#c47e4f`) で「🪙 コイン」
- 右ボタン: ネイビー (`#3d5a6e`) で「🌊 せたなポータル」

---

## Webhook URL 設定

LINE Developers → Messaging API チャネル → Messaging API タブ:

- **Webhook URL**: `https://www.setana.life/api/webhook/line`
- **Webhookの利用**: ON にする
- **検証**: 「検証」ボタンで疎通確認

---

## 必要な環境変数

Vercel ダッシュボード → Settings → Environment Variables:

| 変数名 | 値 | 説明 |
|---|---|---|
| `LINE_MESSAGING_CHANNEL_SECRET` | `a907487152156ba32f30f135239c6370` | 署名検証用 |
| `LINE_CHANNEL_ACCESS_TOKEN` | （Developers で発行） | メッセージ送信用 |
| `FORWARD_EMAIL_ROAD` | （任意） | 道路通報の転送先 |
| `FORWARD_EMAIL_LIGHT` | （任意） | 街灯通報の転送先 |
| `FORWARD_EMAIL_PARK` | （任意） | 公園通報の転送先 |
| `FORWARD_EMAIL_OTHER` | （任意） | その他通報の転送先 |
| `RESEND_API_KEY` | （任意） | メール転送機能を使う場合 |

### Channel Access Token の発行方法

1. [LINE Developers](https://developers.line.biz/) → チャネル選択
2. Messaging API タブ → 「Channel access token」
3. 「Issue」をクリックして発行
4. 発行されたトークンを `LINE_CHANNEL_ACCESS_TOKEN` に設定

---

## Supabase Storage 設定

Supabase ダッシュボード → Storage:

1. 「New bucket」をクリック
2. Bucket name: `reports`
3. **Public bucket**: ✓ ON（写真を公開表示するため）
4. 「Save」

---

## 動作確認

1. 環境変数を設定後、Vercel にデプロイ
2. LINE Developers で Webhook URL を設定し「検証」
3. LINE で bot を友だち追加
4. 「通報」と送って動作確認
5. 管理画面 → 通報・情報管理 で受信確認
