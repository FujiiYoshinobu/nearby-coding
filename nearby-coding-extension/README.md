# 出社アバター - VSCode Extension

VSCode を使った開発がゲーム感覚で楽しくなる拡張機能です！
毎日 VSCode を開くたびに「出社」し、他の開発者と遭遇して XP を獲得し、レベルアップしてアバターを解放しましょう。

## 🎮 機能

### 1. アバター設定画面

- **名前設定**: あなたの開発者名を設定
- **一言コメント**: 他の人への挨拶メッセージ
- **アバタータイプ選択**: レベルに応じて様々なアバターが解放
- **リアルタイムプレビュー**: 設定中のアバターがリアルタイムで確認可能

### 2. 成長システム

- **出社 XP**: VSCode を開くと+10XP（1 日 1 回）
- **遭遇 XP**: 他の開発者との初回遭遇で+5XP（1 人 1 日 1 回）
- **レベルアップ**: XP = 50 × level² の累積計算
- **アバター解放**: レベルアップでどんどん新しいアバターが使えるように

### 3. アバター種類

| レベル | アバター | 絵文字 |
| ------ | -------- | ------ |
| Lv.1   | 人       | 🧑‍💻     |
| Lv.2   | 猫       | 🐱     |
| Lv.3   | ロボット | 🤖     |
| Lv.5   | 魔法使い | 🧙‍♂️     |
| Lv.10  | ドラゴン | 🐉     |
| Lv.10  | バグ     | 🐛     |

### 4. 広場システム

- **リアルタイム遭遇**: 他の開発者が出社すると広場に登場
- **アニメーション**: 自分のアバターは常に歩行アニメーション
- **XP ポップアップ**: 出社・遭遇時に XP 獲得演出
- **レベルアップ演出**: 🎉 レベルアップ時の豪華な演出

## 🚀 インストール方法

1. このプロジェクトをクローン:

```bash
git clone https://github.com/FujiiYoshinobu/nearby-coding.git
cd nearby-coding-extension
```

2. 依存関係をインストール:

```bash
yarn install
```

3. プロジェクトをビルド:

```bash
yarn build
```

4. VS Code で拡張機能を開発モードで実行:
   - `F5`を押して新しい Extension Development Host ウィンドウを開く
   - もしくは `.vsix` ファイルを生成してインストール:

```bash
yarn package
```

## ⚙️ 設定

VS Code の設定で以下の項目をカスタマイズできます:

```json
{
  "nearbyCoding.serverUrl": "https://your-server.com/api/nearby",
  "nearbyCoding.name": "あなたの名前",
  "nearbyCoding.message": "挨拶メッセージ",
  "nearbyCoding.avatar": "🧑‍💻",
  "nearbyCoding.avatarType": "human",
  "nearbyCoding.autoLogin": true
}
```

## 🏗️ 開発者向け

### プロジェクト構造

```
src/
├── extension.ts          # メイン拡張機能
├── types.ts             # TypeScript型定義
├── GrowthSystem.ts      # XP・レベル管理システム
└── webview/
    ├── components/
    │   ├── App.tsx      # メインアプリコンポーネント
    │   ├── AvatarSetup.tsx  # アバター設定画面
    │   ├── Plaza.tsx    # 広場画面
    │   └── Visitor.tsx  # ビジター表示
    └── styles/
        └── index.css    # スタイル定義
```

### ビルドコマンド

```bash
# Webviewのみビルド（開発中）
yarn build-webview

# Webviewの監視ビルド
yarn watch-webview

# 全体をプロダクションビルド
yarn build

# 拡張機能をパッケージ化
yarn package
```

### 技術スタック

- **TypeScript** - 型安全な開発
- **React** - Webview UI フレームワーク
- **Webpack** - モジュールバンドラー
- **VS Code Extension API** - 拡張機能のコア機能

## 🌐 サーバー仕様

この拡張機能は外部 API サーバーと通信します:

### POST /api/nearby

ユーザーの出社情報を送信

```json
{
  "id": "user-id",
  "name": "ユーザー名",
  "message": "挨拶メッセージ",
  "avatar": "🧑‍💻",
  "avatarType": "human",
  "xp": 100,
  "level": 3,
  "lastLogin": "2025-09-21",
  "lastSeen": 1632182400000
}
```

### GET /api/nearby

現在出社中のユーザー一覧を取得

```json
[
  {
    "id": "user-id",
    "name": "ユーザー名",
    "message": "挨拶メッセージ",
    "avatar": "🧑‍💻",
    "avatarType": "human",
    "xp": 100,
    "level": 3,
    "lastLogin": "2025-09-21",
    "lastSeen": 1632182400000
  }
]
```

## 🎯 今後の予定

- [ ] Firebase Functions との本格連携
- [ ] チーム機能（同じプロジェクトの開発者同士での遭遇ボーナス）
- [ ] 実績システム（特定条件でのバッジ獲得）
- [ ] 週間・月間統計画面
- [ ] カスタムアバター機能
- [ ] 音効果・BGM

## 🤝 コントリビューション

プルリクエストやイシューは大歓迎です！

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

**楽しい開発ライフを！** 🚀✨
