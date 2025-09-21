# 出社アバター バックエンド API

Firebase Firestore ベースの出社アバター機能のバックエンド API 実装です。

## 機能

### データベース構造

**users コレクション**

- id: ユーザー ID
- name: 表示名
- message: 挨拶メッセージ
- avatar: アバター絵文字
- avatarType: アバタータイプ (human, cat, robot, wizard, dragon, bug)
- xp: 経験値
- level: レベル
- lastLogin: 最後のログイン日 (YYYY-MM-DD)
- createdAt: 作成日時
- updatedAt: 更新日時

**logins コレクション**

- userId: ユーザー ID
- timestamp: ログイン時刻 (Unix timestamp)
- date: ログイン日 (YYYY-MM-DD)
- createdAt: 作成日時

**encounters コレクション**

- userId: ユーザー ID
- otherUserId: 遭遇相手のユーザー ID
- date: 遭遇日 (YYYY-MM-DD)
- timestamp: 遭遇時刻 (Unix timestamp)
- createdAt: 作成日時

### API エンドポイント

#### POST /api/nearby (ログイン・遭遇処理)

**ログイン**

```json
{
  "action": "login",
  "id": "user-abc123",
  "name": "田中太郎",
  "message": "今日もよろしく！",
  "avatar": "🧑‍💻",
  "avatarType": "human"
}
```

レスポンス:

```json
{
  "success": true,
  "user": {
    /* ユーザー情報 */
  },
  "loginXP": 10,
  "levelUp": false,
  "oldLevel": 1,
  "newLevel": 1,
  "todayUsers": [
    /* その日出社済みのユーザー一覧 */
  ],
  "encounters": [
    /* 新規遭遇したユーザー一覧 */
  ]
}
```

**遭遇処理**

```json
{
  "action": "encounter",
  "id": "user-abc123",
  "encounterUserId": "user-def456"
}
```

#### GET /api/users (ユーザー一覧取得)

クエリパラメータ:

- `since`: Unix timestamp。指定時刻以降に更新されたユーザーのみ取得

#### GET /api/stats (統計情報)

### XP・レベル仕様

- **出社 XP**: +10 (1 日 1 回)
- **遭遇 XP**: +5 (1 人 1 日 1 回)
- **レベル計算**: 必要 XP = 50 × level²
- **アバター解放**:
  - Lv1: 人 (🧑‍💻)
  - Lv2: 猫 (🐱)
  - Lv3: ロボット (🤖)
  - Lv5: 魔法使い (🧙‍♂️)
  - Lv10: ドラゴン (🐉) / バグ (🐛)

## 環境設定

### 環境変数

Vercel の環境変数として設定:

```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...} // JSON形式
```

### Firebase 設定

1. Firebase Console でプロジェクトを作成
2. Firestore データベースを有効化
3. サービスアカウントキーを生成
4. 環境変数に設定

### Firestore セキュリティルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーコレクション（読み取り専用）
    match /users/{document} {
      allow read: if true;
      allow write: if false; // API経由でのみ更新
    }

    // ログイン・遭遇コレクション（読み取り専用）
    match /{collection}/{document} {
      allow read: if collection in ['logins', 'encounters'];
      allow write: if false; // API経由でのみ更新
    }
  }
}
```

## デプロイ

Vercel にデプロイ:

```bash
npm install -g vercel
vercel --prod
```

## 開発

ローカル開発時は Firebase Emulator を使用:

```bash
firebase emulators:start
```
