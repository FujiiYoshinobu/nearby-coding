# VSCode 拡張機能インストールガイド

## VSIX ファイルからのインストール

### 方法 1: VSCode UI から

1. VSCode を開く
2. 拡張機能ビュー (Ctrl+Shift+X)
3. 「・・・」メニュー → 「VSIX からのインストール」
4. `nearby-coding-extension-0.1.0.vsix` を選択

### 方法 2: コマンドラインから

```bash
code --install-extension nearby-coding-extension-0.1.0.vsix
```

### 方法 3: コマンドパレットから

1. `Ctrl+Shift+P` でコマンドパレット
2. `Extensions: Install from VSIX...` を選択
3. VSIX ファイルを選択

## インストール後の確認

1. 拡張機能ビューで「Nearby Coding」が表示される
2. エクスプローラーに「Nearby Coding」ビューが追加される
3. 設定 → 拡張機能 → Nearby Coding で設定項目が表示される

## 初回設定

### サーバー URL 設定

1. 設定を開く (Ctrl+,)
2. 「nearby coding」で検索
3. `Nearby Coding: Server Url` を更新
4. Vercel デプロイ後の URL を設定

例: `https://your-project.vercel.app/api/nearby`

### ユーザー情報設定

- `Nearby Coding: Name`: 表示名
- `Nearby Coding: Message`: 挨拶メッセージ
- `Nearby Coding: Avatar`: アバター絵文字

## アンインストール

### VSCode UI から

1. 拡張機能ビュー
2. 「Nearby Coding」を右クリック
3. 「アンインストール」

### コマンドラインから

```bash
code --uninstall-extension nearby-coding.nearby-coding-extension
```
