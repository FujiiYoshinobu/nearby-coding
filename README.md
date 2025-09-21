# Nearby Coding

VSCode エクスプローラーでリアルタイムに他の開発者を確認できる拡張機能  
同じサーバー URL を使用する開発者が順番に挨拶に訪れるインタラクティブな体験を提供します。

## 構成

- **nearby-coding-server/**: Vercel Edge Function サーバー
- **nearby-coding-extension/**: VSCode 拡張機能

## セットアップ

### 前提条件

- Node.js 18.x 以上
- yarn (推奨) または npm
- VSCode

### 1. 依存関係のインストール

```bash
# ルートディレクトリで実行（yarn ワークスペースを使用）
yarn install
```

### 2. 環境設定

```bash
# Firebase設定のテンプレートをコピー
cd nearby-coding-server
cp .env.example .env
```

`.env`ファイルに Firebase 認証情報を設定してください。

### 3. サーバーのデプロイ

```bash
# 開発環境での実行
yarn server:dev

# 本番環境へのデプロイ
yarn server:deploy
```

### 4. 拡張機能のビルド

```bash
# ワークスペース経由でビルド
yarn extension:build

# または直接ビルド
cd nearby-coding-extension
yarn build
```

### 5. VSCode 拡張パッケージの作成

```bash
# ワークスペース経由でパッケージ作成
yarn extension:package
```

## インストール

1. 上記手順で `.vsix` ファイルを生成
2. VSCode で `Ctrl+Shift+P` (Windows/Linux) または `Cmd+Shift+P` (Mac)
3. 「Extensions: Install from VSIX...」コマンドを実行
4. 生成された `.vsix` ファイルを選択

## 設定

VSCode 設定（settings.json または UI）で以下を設定：

- `nearbyCoding.serverUrl`: Vercel サーバーのエンドポイント  
  例: `https://nearby-coding-server-i3mbz1w0s-fujii-yoshinobus-projects.vercel.app/api/nearby`
- `nearbyCoding.name`: あなたの表示名（例: "田中"）
- `nearbyCoding.message`: 挨拶メッセージ（例: "よろしく！"）
- `nearbyCoding.avatar`: アバター絵文字（例: "🧑‍💻", "👩‍💼", "🦸‍♂️"）

## 使用方法

1. VSCode を開くと、エクスプローラーサイドバーに「Nearby Coding」ビューが表示される
2. ビューには自分のアバターが中央下部に常駐
3. 同じサーバー URL を設定した他のユーザーが右から左にスライドインして挨拶
4. 各ユーザーは 5-7 秒間表示されてから退場
5. 30 秒以内にアクティブなユーザーのみが表示される

## 機能

- **リアルタイム表示**: 10 秒ごとの ping で在室状態を更新
- **アニメーション**: スムーズなスライドイン/アウト効果
- **XSS 対策**: HTML escaping によるセキュリティ確保
- **ダークテーマ**: VSCode のダークテーマに調和したデザイン
- **設定変更**: リアルタイムでの設定反映

## 開発・デバッグ

### サーバー開発

```bash
cd nearby-coding-server
vercel dev
```

### 拡張機能開発

```bash
cd nearby-coding-extension
yarn watch
```

F5 キーで Extension Development Host を起動してテスト

### API テスト

```bash
# POST テスト
curl -X POST https://nearby-coding-server-i3mbz1w0s-fujii-yoshinobus-projects.vercel.app/api/nearby \
  -H "Content-Type: application/json" \
  -d '{"id":"test","name":"テストユーザー","message":"こんにちは","avatar":"🧪"}'

# GET テスト
curl https://nearby-coding-server-i3mbz1w0s-fujii-yoshinobus-projects.vercel.app/api/nearby
```

## トラブルシューティング

- **拡張が表示されない**: VSCode を再起動してください
- **他のユーザーが表示されない**: サーバー URL が正しく設定されているか確認してください
- **CORS エラー**: サーバーが正しくデプロイされているか確認してください
- **ビルドエラー**: `yarn clean` してから再ビルドしてください

## ライセンス

MIT License
