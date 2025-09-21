# VS Code 拡張機能開発手順

## エラーの解決方法

エラー「開発中の拡張機能は無効であるため、読み込めませんでした」が表示される場合：

### 方法 1: 拡張機能ディレクトリを直接開く

1. VS Code を閉じる
2. VS Code で以下のディレクトリを開く：
   ```
   c:\Users\pinkb\Documents\VSCode\nearby-coding\nearby-coding-extension
   ```
3. F5 キーでデバッグ実行

### 方法 2: Workspace ファイルを使用

1. VS Code を閉じる
2. 以下のファイルを開く：
   ```
   c:\Users\pinkb\Documents\VSCode\nearby-coding\nearby-coding.code-workspace
   ```
3. VS Code で Workspace が開かれる
4. F5 キーでデバッグ実行

## 開発ワークフロー

### 初期セットアップ

```bash
cd c:\Users\pinkb\Documents\VSCode\nearby-coding\nearby-coding-extension
yarn install
yarn build
```

### 日常的な開発

1. React コンポーネントを編集: `src/webview/components/`
2. ビルド実行: `yarn build-webview`
3. F5 でデバッグ実行
4. 拡張機能の動作を確認

### ウォッチモード開発

```bash
# ターミナルで実行（自動ビルド）
yarn watch-webview

# 別ターミナルまたはF5でデバッグ実行
```

## ディレクトリ構造の説明

```
nearby-coding/                    # モノレポルート（VS Codeでこれを開くとエラー）
├── nearby-coding-extension/      # 拡張機能（VS Codeでこれを開く）
│   ├── package.json             # 拡張機能の設定
│   ├── src/extension.ts         # 拡張機能メイン
│   ├── src/webview/            # Reactアプリ
│   └── .vscode/                # VS Code設定
└── nearby-coding-server/        # サーバー
```

## トラブルシューティング

- **拡張機能が読み込めない**: 正しいディレクトリを開いているか確認
- **React が表示されない**: `yarn build-webview` 実行後に再起動
- **ビルドエラー**: `yarn install` で依存関係を再インストール
