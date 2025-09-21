// Vercel Serverless Function: /api/users
// ユーザー一覧とリアルタイム更新用API

import { UserService } from '../lib/userService.js';

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  const { method } = req;
  
  setCORSHeaders(res);

  // CORSプリフライト対応
  if (method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const userService = new UserService();

    // GET: 今日の出社ユーザー一覧
    if (method === 'GET') {
      const { since } = req.query;
      const todayUsers = await userService.getTodayActiveUsers();
      
      let responseUsers = todayUsers;
      
      // since パラメータが指定されている場合、それ以降に更新されたユーザーのみ返す
      if (since) {
        const sinceTime = parseInt(since, 10);
        responseUsers = todayUsers.filter(user => {
          const updatedTime = new Date(user.updatedAt).getTime();
          return updatedTime > sinceTime;
        });
      }
      
      return res.status(200).json({
        success: true,
        users: responseUsers,
        timestamp: Date.now()
      });
    }

    // 対応していないメソッド
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
    
  } catch (error) {
    console.error('Users API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}