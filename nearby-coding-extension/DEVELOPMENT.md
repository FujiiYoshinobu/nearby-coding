# 出社アバター Extension - Development Guide

本拡張機能は、VSCode での開発体験をゲーミフィケーションする「出社アバター」機能を提供します。

## 概要

VS Code 拡張機能の Webview UI を React で開発できる環境が構築されました。

## 開発環境の特徴

- **React ベースの UI 開発**: Webview で React コンポーネントを使用
- **TypeScript 対応**: 型安全な開発が可能
- **ホットリロード**: 開発時の高速なフィードバックループ
- **Yarn パッケージ管理**: 依存関係の管理に Yarn を使用

## ディレクトリ構造

```
nearby-coding-extension/
├── src/
│   ├── extension.ts              # VS Code拡張機能のメインエントリー
│   └── webview/                  # React UI コンポーネント
│       ├── index.tsx             # Reactアプリのエントリーポイント
│       ├── mock.ts               # 開発用モックデータ
│       ├── components/           # Reactコンポーネント
│       │   ├── App.tsx           # メインアプリケーション
│       │   ├── Plaza.tsx         # プラザコンポーネント
│       │   └── Visitor.tsx       # ビジターコンポーネント
│       └── styles/               # スタイル
│           └── index.css         # メインスタイルシート
├── webpack.config.js             # プロダクション用Webpackコンフィグ
├── webpack.dev.config.js         # 開発サーバー用Webpackコンフィグ
└── dist/                         # ビルド出力
    ├── extension.js              # VS Code拡張機能
    ├── webview.js               # ReactアプリのバンドルJS
    └── webview.html             # WebviewのHTMLテンプレート
```

## dist の役割

- src/: 開発用ソースコード（編集するファイル）
- dist/: 実行ファイル（VS Code が実際に読み込むファイル）
- ビルド時に src/ → dist/ に変換される

### 🚀 VSIX ファイル作成プロセス

```# 1. ビルド（src → dist）
yarn build

# 2. VSIXファイル作成
yarn package
```

作成されたファイル: nearby-coding-extension-0.1.0.vsix

### 📦 VSIX ファイルの使用方法

1. 他の人に配布: VSIX ファイルを送る
2. インストール:
   `code --install-extension nearby-coding-extension-0.1.0.vsix`
3. VS Code UI: Extensions → ... → Install from VSIX

### 🔄 開発ワークフロー

```# 開発中
yarn build-webview    # React部分のみビルド
# F5でデバッグ実行

# 配布準備
yarn build            # 全体ビルド（最適化）
yarn package          # VSIXファイル作成
```

## 開発コマンド

### 初回セットアップ

```bash
cd nearby-coding-extension
yarn install
```

### VS Code 拡張機能のビルド

**プロダクションビルド:**

```bash
yarn build
```

**開発用ビルド:**

```bash
yarn build-webview
```

**ウォッチモード（自動リビルド）:**

```bash
yarn watch-webview
```

### 開発ワークフロー

1. **React コンポーネントの開発**

   - `src/webview/components/` で React コンポーネントを編集
   - TypeScript + JSX で開発可能
   - モックデータは `src/webview/mock.ts` で設定

2. **ビルドとテスト**

   - `yarn build-webview` で React アプリをビルド
   - F5 で VS Code 拡張機能をデバッグ実行
   - Webview でリアルタイムに変更を確認

3. **ウォッチモード開発**
   - `yarn watch-webview` で自動ビルドを有効化
   - ファイル変更時に自動的に Webview が更新

## React 開発のポイント

### VS Code API 連携

- `window.acquireVsCodeApi()` で VS Code API にアクセス
- メッセージパッシングで VS Code 拡張機能と通信
- 開発環境ではモック API を自動使用

### スタイリング

- CSS ファイルは `src/webview/styles/` に配置
- VS Code テーマに合わせたダークモード対応
- CSS-in-JS も利用可能

### 状態管理

- React Hooks を使用した状態管理
- VS Code からのメッセージを useEffect で処理
- ローカル状態と VS Code 状態の同期

## トラブルシューティング

### ビルドエラー

- `yarn install` で依存関係を再インストール
- TypeScript エラーは `tsconfig.json` の設定を確認

### Webview 表示されない

- `yarn build-webview` で React アプリをビルド
- `dist/webview.js` と `dist/webview.html` が生成されているか確認

### ホットリロードが効かない

- 現在は手動リロードが必要
- ファイル変更後に `yarn build-webview` を実行

## 今後の改善予定

- [ ] webpack-dev-server による完全なホットリロード
- [ ] CSS-in-JS ライブラリの導入検討
- [ ] Storybook によるコンポーネント開発環境
- [ ] Jest + Testing Library によるテスト環境
