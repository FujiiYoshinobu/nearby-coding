# Firebase Service Account Key 設定ガイド

## ステップ 1: 秘密鍵ファイルの取得

1. Firebase Console → プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」
3. JSON ファイルをダウンロード → `Downloads`フォルダに保存

## ステップ 2: JSON の内容を 1 行にする

### Windows PowerShell の場合:

```powershell
# ダウンロードしたファイルのパスを指定
$jsonPath = "C:\Users\pinkb\Downloads\nearby-coding-app-firebase-adminsdk-xxxxx.json"
$jsonContent = Get-Content $jsonPath -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
$jsonContent | Set-Clipboard
Write-Host "JSONがクリップボードにコピーされました"
```

### 手動の場合:

1. JSON ファイルをテキストエディタで開く
2. 全ての改行を削除して 1 行にする
3. 例: `{"type":"service_account","project_id":"nearby-coding-app",...}`

## ステップ 3: Vercel に環境変数として設定

### コマンドライン:

```bash
cd nearby-coding-server
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
# ↑ ここで1行にしたJSONを貼り付け
```

### Vercel Dashboard:

1. https://vercel.com/dashboard
2. プロジェクト選択 → Settings → Environment Variables
3. `FIREBASE_SERVICE_ACCOUNT_KEY`を追加
4. 1 行にした JSON を値として設定

## ⚠️ 重要な注意点

### やってはいけないこと:

- ❌ プロジェクトフォルダに.json ファイルを直接配置
- ❌ GitHub に push
- ❌ 公開リポジトリに含める

### 安全な管理:

- ✅ 環境変数として設定
- ✅ ダウンロード後はローカルファイルを削除
- ✅ .gitignore で除外（念のため）

## ローカル開発用（オプション）

ローカル開発時のみ、以下の場所に配置可能:

```
nearby-coding-server/
├── .env.local          # ← ここに設定
├── api/
└── lib/
```

.env.local の内容:

```
FIREBASE_PROJECT_ID=nearby-coding-app
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

**重要**: .gitignore で除外:

```
.env.local
*.json
```
