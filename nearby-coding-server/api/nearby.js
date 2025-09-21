// Vercel Serverless Function: /api/nearby
// 出社アバター機能のメインAPI

import { UserService } from '../lib/userService.js';

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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

    // POST /login: ログイン処理
    if (method === 'POST') {
      const body = req.body;
      const { 
        action = 'login',
        id, 
        name, 
        message = 'よろしく！', 
        avatar = '🧑‍💻',
        avatarType = 'human',
        encounterUserId
      } = body || {};

      // 必須フィールドチェック
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      if (action === 'login') {
        // ログイン処理
        if (!name) {
          return res.status(400).json({ 
            success: false, 
            error: 'Name is required for login' 
          });
        }

        const loginResult = await userService.processLogin(id, {
          name,
          message,
          avatar,
          avatarType
        });

        // その日出社済みのユーザー一覧を取得
        const todayUsers = await userService.getTodayActiveUsers();
        
        // 自分以外のユーザーとの遭遇処理
        const encounters = [];
        for (const otherUser of todayUsers) {
          if (otherUser.id !== id) {
            const encounterResult = await userService.processEncounter(id, otherUser.id);
            if (!encounterResult.alreadyEncountered && encounterResult.xpGained > 0) {
              encounters.push({
                user: otherUser,
                xpGained: encounterResult.xpGained
              });
            }
          }
        }

        return res.status(200).json({
          success: true,
          user: loginResult.user,
          loginXP: loginResult.xpGained,
          levelUp: loginResult.levelUp,
          oldLevel: loginResult.oldLevel,
          newLevel: loginResult.newLevel,
          todayUsers: todayUsers.filter(u => u.id !== id), // 自分以外
          encounters
        });
        
      } else if (action === 'encounter') {
        // 遭遇処理
        if (!encounterUserId) {
          return res.status(400).json({ 
            success: false, 
            error: 'encounterUserId is required for encounter action' 
          });
        }

        const encounterResult = await userService.processEncounter(id, encounterUserId);
        
        return res.status(200).json({
          success: true,
          xpGained: encounterResult.xpGained,
          levelUp: encounterResult.levelUp,
          oldLevel: encounterResult.oldLevel,
          newLevel: encounterResult.newLevel,
          alreadyEncountered: encounterResult.alreadyEncountered,
          user: encounterResult.user
        });
        
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use "login" or "encounter"' 
        });
      }
    }

    // GET /users: 今日の出社ユーザー一覧
    if (method === 'GET') {
      const todayUsers = await userService.getTodayActiveUsers();
      
      return res.status(200).json({
        success: true,
        users: todayUsers
      });
    }

    // 対応していないメソッド
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}