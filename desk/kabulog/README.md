# 株ログ（KabuLog）- 株式損益トラッカー

株式売買の損益と配当を記録し、銘柄別・年月別に分析できる PWA アプリです。

## 機能

- 売買記録（買い・売り）の管理
- 配当金の記録
- ポートフォリオ（保有銘柄）の自動計算（移動平均法）
- 銘柄別・月別・年別の損益サマリー
- Google ログイン＋Google Drive にデータ自動保存
- PWA（ホーム画面に追加してアプリとして使用可能）
- オフライン対応（ローカルキャッシュ）

## セットアップ手順

### 1. Google Cloud Console の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（例: `kabulog`）
3. **APIとサービス → ライブラリ** で以下を有効化:
   - `Google Drive API`
4. **APIとサービス → OAuth 同意画面** を設定:
   - ユーザータイプ: **外部**
   - アプリ名: `株ログ`
   - スコープ: `https://www.googleapis.com/auth/drive.appdata`
   - テストユーザー: 自分のメールアドレスを追加（本番公開前）
5. **APIとサービス → 認証情報 → OAuth 2.0 クライアント ID** を作成:
   - アプリケーションの種類: **ウェブ アプリケーション**
   - 名前: `株ログ Web`
   - **承認済みの JavaScript 生成元** に追加:
     - `https://あなたのドメイン.pages.dev`（Cloudflare Pages のドメイン）
     - `http://localhost:8080`（ローカル開発用）
   - 作成後に表示される **クライアント ID** をコピー

### 2. コードにクライアント ID を設定

`index.html` の以下の行を編集:

```javascript
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

↑ ここに手順1でコピーした Client ID を貼り付ける。

### 3. GitHub にプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/あなた/kabulog.git
git push -u origin main
```

### 4. Cloudflare Pages にデプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages → Create** → **Pages** タブ
3. **Connect to Git** → GitHub リポジトリを選択
4. ビルド設定:
   - フレームワーク: `None`
   - ビルドコマンド: （空欄）
   - ビルド出力ディレクトリ: `/`（ルート直下）
5. デプロイ実行

### 5. Google Cloud Console で本番ドメインを追加

手順1の OAuth クライアント ID の「承認済みの JavaScript 生成元」に、
Cloudflare Pages で割り当てられたドメインを追加:

```
https://kabulog.pages.dev
```

### 6. 本番公開（任意）

Google Cloud Console の OAuth 同意画面で「公開」ステータスにすると、
テストユーザー以外も利用可能になります。
配布する場合は Google の審査が必要です。

## カラーパレットの変更

`index.html` の CSS 変数セクション（`:root` 内）にある8変数を、
`901-enu-color-palettes.md` のお好みのパレットに差し替えてください。
`manifest.json` の `theme_color` と `background_color` も合わせて更新してください。

## データ形式

データは Google Drive の `appDataFolder`（アプリ専用隠しフォルダ）に
`kabulog-data.json` として保存されます。

```json
{
  "version": 1,
  "trades": [...],
  "dividends": [...],
  "settings": {},
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

`version` フィールドによるマイグレーション機構があるため、
将来フォーマットが変わっても古いデータは自動変換されます。

## ローカル開発

```bash
# Python の場合
python3 -m http.server 8080

# Node.js の場合
npx serve -l 8080
```

`http://localhost:8080` でアクセス。

## ファイル構成

```
kabulog/
├── index.html       ← メインアプリ（CSS/JS インライン）
├── manifest.json    ← PWA マニフェスト
├── sw.js            ← Service Worker
├── icon.svg         ← アプリアイコン（SVG）
├── icon-192.png     ← PWA アイコン 192px
├── icon-512.png     ← PWA アイコン 512px
└── README.md        ← このファイル
```
