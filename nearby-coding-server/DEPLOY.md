# Vercel 環境変数設定ガイド

## Firebase 設定

### FIREBASE_PROJECT_ID

- 値: Firebase Console で作成したプロジェクト ID
- 例: nearby-coding-app

### FIREBASE_SERVICE_ACCOUNT_KEY

- 値: サービスアカウントキーの JSON 全体（1 行に圧縮）
- 例: {"type":"service_account","project_id":"nearby-coding-app",...}

## Vercel Dashboard での設定方法

1. Vercel Dashboard → プロジェクト選択 → Settings → Environment Variables
2. 各環境変数を追加:

   - Name: FIREBASE_PROJECT_ID
   - Value: [プロジェクト ID]
   - Environment: Production, Preview, Development

3. FIREBASE_SERVICE_ACCOUNT_KEY の設定:
   - JSON ファイルの内容を 1 行に圧縮してコピー
   - 改行や空白を削除した状態で貼り付け

## CLI での設定方法

```bash
# プロジェクトIDを設定
vercel env add FIREBASE_PROJECT_ID
> nearby-coding-app

# サービスアカウントキーを設定（1行のJSONとして）
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
> {"type":"service_account","project_id":"nearby-coding-app",...}
```

## 設定確認

```bash
# 環境変数一覧表示
vercel env ls

# テストデプロイ
vercel --prod
```
