# 🚀 出社アバター - 完全デプロイガイド

このガイドに従って、出社アバター機能を完全にデプロイできます。

## 📋 前提条件

- Node.js 18.x 以上
- yarn
- Google アカウント (Firebase 用)
- Vercel アカウント
- VSCode

## ステップ 1: Firebase プロジェクト設定 🔥

### 1.1 Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」
3. プロジェクト名を入力 (例: `nearby-coding-app`)
4. Google アナリティクスは任意で設定

### 1.2 Firestore データベース有効化

1. Firebase Console → Firestore Database
2. 「データベースを作成」
3. **本番環境モード**を選択
4. ロケーション: `asia-northeast1` (東京)

### 1.3 サービスアカウントキー生成

1. Firebase Console → プロジェクトの設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. JSON ファイルをダウンロード → **安全な場所に保存**

### 1.4 Firestore セキュリティルール設定

1. Firebase Console → Firestore Database → ルール
2. 以下をコピペ:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if false;
    }
    match /logins/{loginId} {
      allow read: if true;
      allow write: if false;
    }
    match /encounters/{encounterId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

3. 「公開」をクリック

## ステップ 2: Vercel デプロイ 🚀

### 2.1 Vercel CLI 設定

```bash
# Vercel CLIインストール (まだの場合)
npm install -g vercel

# Vercelにログイン
vercel login
```

### 2.2 プロジェクトデプロイ

```bash
cd nearby-coding-server

# 初回デプロイ
vercel

# 質問に答える:
# ? Set up and deploy "~/nearby-coding-server"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? nearby-coding-server
# ? In which directory is your code located? ./
```

### 2.3 環境変数設定

```bash
# Firebase Project IDを設定
vercel env add FIREBASE_PROJECT_ID
# → 入力: your-firebase-project-id

# Firebase Service Account Keyを設定
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
# → ダウンロードしたJSONファイルの内容を1行で貼り付け
```

**重要**: JSON を 1 行にする方法

```bash
# macOS/Linux
cat path/to/service-account.json | tr -d '\\n'

# Windows PowerShell
(Get-Content path\\to\\service-account.json -Raw) -replace \"\\r\\n\", \"\"
```

### 2.4 本番デプロイ

```bash
# 本番環境にデプロイ
vercel --prod
```

**デプロイ URL**をメモしてください (例: `https://nearby-coding-server-abc123.vercel.app`)

## ステップ 3: VSCode 拡張機能パッケージ化 📦

### 3.1 拡張機能ビルド・パッケージ化

```bash
cd nearby-coding-extension

# ビルド
yarn build

# VSIXパッケージ作成
vsce package
```

### 3.2 サーバー URL 設定更新

拡張機能の設定でデフォルトサーバー URL を更新:

`nearby-coding-extension/package.json`:

```json
\"nearbyCoding.serverUrl\": {
  \"default\": \"https://YOUR-VERCEL-URL.vercel.app/api/nearby\"
}
```

再ビルド:

```bash
yarn build
vsce package
```

## ステップ 4: 動作確認 🧪

### 4.1 VSCode 拡張機能インストール

```bash
code --install-extension nearby-coding-extension-0.1.0.vsix
```

### 4.2 設定確認

1. VSCode 設定 (Ctrl+,)
2. 「nearby coding」で検索
3. Server URL が正しく設定されているか確認

### 4.3 API テスト

```bash
# サーバーAPIテスト
curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/nearby \\
  -H \"Content-Type: application/json\" \\
  -d '{\"action\":\"login\",\"id\":\"test-user\",\"name\":\"テストユーザー\"}'
```

### 4.4 拡張機能動作確認

1. VSCode を再起動
2. エクスプローラーに「Nearby Coding」ビューが表示される
3. 初回設定でアバター情報を入力
4. 広場画面が表示される

## 🎉 完了！

- ✅ Firebase Firestore 設定完了
- ✅ Vercel サーバー API 稼働
- ✅ VSCode 拡張機能インストール可能
- ✅ 出社アバター機能が動作

## トラブルシューティング 🔧

### Firebase 接続エラー

- 環境変数が正しく設定されているか確認
- サービスアカウントキーの JSON が 1 行になっているか確認

### API 接続エラー

- Vercel のデプロイ URL が正しいか確認
- CORS 設定が有効か確認

### 拡張機能エラー

- VSCode の開発者ツールでエラーログ確認
- 設定のサーバー URL が正しいか確認

## 📚 参考リンク

- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [VSCode Extension Development](https://code.visualstudio.com/api)
