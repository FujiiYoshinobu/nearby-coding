// Vercel Serverless Function: /api/nearby
// インメモリでユーザー情報を管理（30秒TTL）

const users = new Map();

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  const { method } = req;
  const now = Date.now();
  
  setCORSHeaders(res);

  // CORSプリフライト対応
  if (method === 'OPTIONS') {
    return res.status(204).end();
  }

  // POST: ユーザー情報を登録/更新
  if (method === 'POST') {
    const body = req.body;

    const { id, name, message = 'よろしく！', avatar = '🧑‍💻' } = body || {};

    // 必須フィールドチェック
    if (!id || !name) {
      return res.status(400).json({ ok: false, error: 'id and name are required' });
    }

    // ユーザー情報を更新
    users.set(id, { 
      id, 
      name, 
      message, 
      avatar, 
      lastSeen: now 
    });

    return res.status(200).json({ ok: true });
  }

  // GET: アクティブユーザー一覧を返す
  if (method === 'GET') {
    // 30秒以内にlastSeenが更新されたユーザーのみ返す
    const activeUsers = Array.from(users.values())
      .filter(user => now - user.lastSeen < 30000);

    return res.status(200).json(activeUsers);
  }

  // 対応していないメソッド
  return res.status(405).end('Method Not Allowed');
}