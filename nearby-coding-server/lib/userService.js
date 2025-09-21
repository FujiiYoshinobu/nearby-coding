// ユーザー管理サービス
import { calculateLevel, db, getTodayString } from './firebase.js';

export class UserService {
  constructor() {
    this.usersCollection = db.collection('users');
    this.loginsCollection = db.collection('logins');
    this.encountersCollection = db.collection('encounters');
  }

  /**
   * ユーザー情報を取得または作成
   */
  async getOrCreateUser(userId, userData) {
    const userDoc = await this.usersCollection.doc(userId).get();
    
    if (userDoc.exists) {
      return { id: userId, ...userDoc.data() };
    }
    
    // 新規ユーザーを作成
    const newUser = {
      id: userId,
      name: userData.name || 'Anonymous',
      message: userData.message || 'よろしく！',
      avatar: userData.avatar || '🧑‍💻',
      avatarType: userData.avatarType || 'human',
      xp: 0,
      level: 1,
      lastLogin: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.usersCollection.doc(userId).set(newUser);
    return newUser;
  }

  /**
   * ユーザー情報を更新
   */
  async updateUser(userId, updates) {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.usersCollection.doc(userId).update(updateData);
    return await this.getUserById(userId);
  }

  /**
   * ユーザー情報を取得
   */
  async getUserById(userId) {
    const userDoc = await this.usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }
    return { id: userId, ...userDoc.data() };
  }

  /**
   * 今日ログインしたユーザー一覧を取得
   */
  async getTodayActiveUsers() {
    const today = getTodayString();
    const todayStart = new Date(today + 'T00:00:00Z');
    
    const loginsSnapshot = await this.loginsCollection
      .where('date', '==', today)
      .get();
    
    const userIds = new Set();
    loginsSnapshot.forEach(doc => {
      userIds.add(doc.data().userId);
    });
    
    if (userIds.size === 0) {
      return [];
    }
    
    // ユーザー情報を取得
    const users = [];
    for (const userId of userIds) {
      try {
        const user = await this.getUserById(userId);
        users.push(user);
      } catch (error) {
        console.warn(`Failed to get user ${userId}:`, error.message);
      }
    }
    
    return users;
  }

  /**
   * ログイン処理
   */
  async processLogin(userId, userData) {
    const today = getTodayString();
    const now = new Date();
    
    // ユーザー情報を取得または作成
    let user = await this.getOrCreateUser(userId, userData);
    
    // 今日既にログインしているかチェック
    const existingLogin = await this.loginsCollection
      .where('userId', '==', userId)
      .where('date', '==', today)
      .limit(1)
      .get();
    
    let xpGained = 0;
    let levelUp = false;
    let oldLevel = user.level;
    
    if (existingLogin.empty) {
      // 初回ログイン：出社XP付与
      xpGained = 10;
      const newXP = user.xp + xpGained;
      const newLevel = calculateLevel(newXP);
      levelUp = newLevel > oldLevel;
      
      // ログイン記録を作成
      await this.loginsCollection.add({
        userId,
        timestamp: now.getTime(),
        date: today,
        createdAt: now.toISOString()
      });
      
      // ユーザーのXPとレベルを更新
      user = await this.updateUser(userId, {
        xp: newXP,
        level: newLevel,
        lastLogin: today,
        name: userData.name || user.name,
        message: userData.message || user.message,
        avatar: userData.avatar || user.avatar,
        avatarType: userData.avatarType || user.avatarType
      });
    } else {
      // 既存ログイン：ユーザー情報のみ更新
      user = await this.updateUser(userId, {
        name: userData.name || user.name,
        message: userData.message || user.message,
        avatar: userData.avatar || user.avatar,
        avatarType: userData.avatarType || user.avatarType
      });
    }
    
    return {
      user,
      xpGained,
      levelUp,
      oldLevel,
      newLevel: user.level
    };
  }

  /**
   * 遭遇処理
   */
  async processEncounter(userId, otherUserId) {
    if (userId === otherUserId) {
      return { xpGained: 0, alreadyEncountered: true };
    }
    
    const today = getTodayString();
    
    // 今日既に遭遇しているかチェック
    const existingEncounter = await this.encountersCollection
      .where('userId', '==', userId)
      .where('otherUserId', '==', otherUserId)
      .where('date', '==', today)
      .limit(1)
      .get();
    
    if (!existingEncounter.empty) {
      return { xpGained: 0, alreadyEncountered: true };
    }
    
    // 新規遭遇を記録
    await this.encountersCollection.add({
      userId,
      otherUserId,
      date: today,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    });
    
    // XPを付与
    const user = await this.getUserById(userId);
    const xpGained = 5;
    const newXP = user.xp + xpGained;
    const oldLevel = user.level;
    const newLevel = calculateLevel(newXP);
    const levelUp = newLevel > oldLevel;
    
    const updatedUser = await this.updateUser(userId, {
      xp: newXP,
      level: newLevel
    });
    
    return {
      user: updatedUser,
      xpGained,
      levelUp,
      oldLevel,
      newLevel,
      alreadyEncountered: false
    };
  }
}