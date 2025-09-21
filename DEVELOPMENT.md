# 出社アバター VSCode 拡張 - 開発ガイド

yarn ワークスペースを使用したモノレポ構成での開発ガイドです。

## プロジェクト構造

```
nearby-coding/
├── package.json                    # ルートワークスペース設定
├── nearby-coding-extension/        # VSCode拡張機能
│   ├── src/
│   ├── package.json
│   └── webpack.config.js
└── nearby-coding-server/           # Vercel Serverless API
    ├── api/
    ├── lib/
    └── package.json
```

## セットアップ

### 1. 依存関係のインストール

```bash
# ルートディレクトリで実行
yarn install
```

これで全てのワークスペースの依存関係が自動的にインストールされます。

### 2. 環境変数の設定

サーバー用の環境変数を設定：

```bash
cd nearby-coding-server
cp .env.example .env
```

`.env`ファイルに Firebase の認証情報を設定してください。

## 開発

### 拡張機能の開発

```bash
# 拡張機能をビルド
yarn extension:build

# ウォッチモードで開発
yarn extension:watch

# VSIXパッケージを作成
yarn extension:package
```

### サーバー開発

```bash
# ローカル開発サーバーを起動
yarn server:dev

# 本番環境にデプロイ
yarn server:deploy
```

### 両方を同時に開発

```bash
# 拡張機能とサーバーを同時に開発モードで起動
yarn dev
```

## yarn ワークスペースコマンド

### 特定のワークスペースでコマンド実行

```bash
# 拡張機能でコマンド実行
yarn workspace nearby-coding-extension run <command>

# サーバーでコマンド実行
yarn workspace nearby-coding-server run <command>
```

### 全ワークスペースでコマンド実行

```bash
# 全てのワークスペースでビルド実行
yarn workspaces run build
```

### 依存関係の管理

```bash
# 拡張機能に依存関係追加
yarn workspace nearby-coding-extension add <package>

# サーバーに依存関係追加
yarn workspace nearby-coding-server add <package>

# 開発依存関係として追加
yarn workspace nearby-coding-extension add -D <package>
```

## よく使うコマンド

```bash
# プロジェクト全体をクリーンアップして再インストール
yarn fresh

# 特定のワークスペースをクリーンアップ
yarn workspace nearby-coding-extension run clean

# 依存関係の情報確認
yarn workspaces info

# ワークスペース一覧表示
yarn workspaces list
```

## デバッグ

### VSCode 拡張機能

1. `F5`キーまたは「実行 > デバッグの開始」
2. 新しい VSCode ウィンドウが開かれる
3. 拡張機能が自動的にアクティベートされる

### サーバー API

```bash
# ローカルでサーバーを起動
yarn server:dev

# APIテスト
curl -X POST http://localhost:3000/api/nearby \
  -H "Content-Type: application/json" \
  -d '{"action":"login","id":"test-user","name":"テストユーザー"}'
```

## トラブルシューティング

### yarn コマンドが見つからない

```bash
# yarnをグローバルインストール
npm install -g yarn

# または npx 経由で実行
npx yarn install
```

### 依存関係の競合

```bash
# yarn.lockを削除して再インストール
rm yarn.lock
yarn install
```

### ビルドエラー

```bash
# node_modulesをクリーンアップ
yarn clean
yarn install
yarn build
```

## ファイル監視

### 自動再ビルド

```bash
# 拡張機能の自動再ビルド
yarn extension:watch

# サーバーのファイル監視（Vercel dev）
yarn server:dev
```

## コードフォーマット・リント

```bash
# 拡張機能側でESLint/Prettier実行
yarn workspace nearby-coding-extension run lint
yarn workspace nearby-coding-extension run format
```
