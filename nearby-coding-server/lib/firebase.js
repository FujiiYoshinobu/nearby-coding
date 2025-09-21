// Firebase Admin SDK設定
import admin from 'firebase-admin';

// Firebase Admin SDKの初期化
let app;

if (!admin.apps.length) {
  // 本番環境では環境変数から認証情報を取得
  // 開発環境では以下の設定を適用（実際の認証情報が必要）
  let serviceAccount = null;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      // Base64エンコードされている場合はデコードしてからパース
      const keyData = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (keyData.startsWith('ew') || keyData.startsWith('eyJ')) {
        // Base64エンコードされている場合
        const decodedKey = Buffer.from(keyData, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decodedKey);
      } else {
        // 直接JSON文字列の場合
        serviceAccount = JSON.parse(keyData);
      }
    } catch (error) {
      console.error('Failed to parse Firebase service account key:', error.message);
      serviceAccount = null;
    }
  }

  if (serviceAccount) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'nearby-coding-demo'
    });
  } else {
    // 開発時のダミー設定
    console.warn('Firebase credentials not found, using emulator mode');
    app = admin.initializeApp({
      projectId: 'nearby-coding-demo'
    });
  }
} else {
  app = admin.app();
}

export const db = admin.firestore(app);
export const auth = admin.auth(app);

// ユーティリティ関数
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

export const calculateLevel = (xp) => {
  let level = 1;
  while (50 * level * level <= xp) {
    level++;
  }
  return level;
};

export const calculateRequiredXP = (level) => {
  return 50 * level * level;
};