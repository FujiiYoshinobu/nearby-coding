// Vercel Serverless Function: /api/stats
// 統計情報とデバッグ用API

import { db, getTodayString } from '../lib/firebase.js';

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
    // GET: 統計情報
    if (method === 'GET') {
      const today = getTodayString();
      
      // 各コレクションの統計を取得
      const usersSnapshot = await db.collection('users').get();
      const todayLoginsSnapshot = await db.collection('logins')
        .where('date', '==', today)
        .get();
      const todayEncountersSnapshot = await db.collection('encounters')
        .where('date', '==', today)
        .get();
      
      // レベル別ユーザー数
      const levelStats = {};
      const avatarStats = {};
      
      usersSnapshot.forEach(doc => {
        const user = doc.data();
        const level = user.level || 1;
        const avatarType = user.avatarType || 'human';
        
        levelStats[level] = (levelStats[level] || 0) + 1;
        avatarStats[avatarType] = (avatarStats[avatarType] || 0) + 1;
      });
      
      const stats = {
        totalUsers: usersSnapshot.size,
        todayLogins: todayLoginsSnapshot.size,
        todayEncounters: todayEncountersSnapshot.size,
        levelDistribution: levelStats,
        avatarDistribution: avatarStats,
        date: today,
        timestamp: Date.now()
      };
      
      return res.status(200).json({
        success: true,
        stats
      });
    }

    // 対応していないメソッド
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
    
  } catch (error) {
    console.error('Stats API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}