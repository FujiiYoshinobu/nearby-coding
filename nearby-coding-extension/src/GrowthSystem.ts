import {
    AvatarType,
    calculateLevel,
    EncounterRecord,
    getNewlyUnlockedAvatars,
    getTodayString,
    LoginRecord,
    User
} from './types';

/**
 * 出社アバター機能の成長システムを管理するクラス
 */
export class GrowthSystem {
  private encounters: EncounterRecord[] = [];
  private logins: LoginRecord[] = [];

  constructor(
    encounters: EncounterRecord[] = [],
    logins: LoginRecord[] = []
  ) {
    this.encounters = encounters;
    this.logins = logins;
  }

  /**
   * ログイン処理とXP付与
   */
  processLogin(user: User): { 
    xpGained: number; 
    levelUp: boolean; 
    newLevel: number; 
    unlockedAvatars: AvatarType[] 
  } {
    const today = getTodayString();
    const hasLoggedInToday = this.logins.some(
      login => login.userId === user.id && login.date === today
    );

    if (hasLoggedInToday) {
      // 既にログイン済み
      return { 
        xpGained: 0, 
        levelUp: false, 
        newLevel: user.level, 
        unlockedAvatars: [] 
      };
    }

    // 新規ログイン記録
    this.logins.push({
      userId: user.id,
      timestamp: Date.now(),
      date: today
    });

    return this.addXP(user, 10, 'login');
  }

  /**
   * 遭遇処理とXP付与
   */
  processEncounter(user: User, otherUserId: string): {
    xpGained: number;
    levelUp: boolean;
    newLevel: number;
    unlockedAvatars: AvatarType[];
  } {
    const today = getTodayString();
    const hasEncounteredToday = this.encounters.some(
      encounter => 
        encounter.userId === user.id && 
        encounter.otherUserId === otherUserId && 
        encounter.date === today
    );

    if (hasEncounteredToday) {
      // 既に今日遭遇済み
      return { 
        xpGained: 0, 
        levelUp: false, 
        newLevel: user.level, 
        unlockedAvatars: [] 
      };
    }

    // 新規遭遇記録
    this.encounters.push({
      userId: user.id,
      otherUserId: otherUserId,
      date: today
    });

    return this.addXP(user, 5, 'encounter');
  }

  /**
   * XP追加とレベルアップ判定
   */
  private addXP(user: User, xpAmount: number, source: 'login' | 'encounter'): {
    xpGained: number;
    levelUp: boolean;
    newLevel: number;
    unlockedAvatars: AvatarType[];
  } {
    const oldLevel = user.level;
    const newXP = user.xp + xpAmount;
    const newLevel = calculateLevel(newXP);
    const levelUp = newLevel > oldLevel;
    const unlockedAvatars = levelUp ? getNewlyUnlockedAvatars(oldLevel, newLevel) : [];

    return {
      xpGained: xpAmount,
      levelUp,
      newLevel,
      unlockedAvatars
    };
  }

  /**
   * 今日の遭遇リストを取得
   */
  getTodayEncounters(userId: string): string[] {
    const today = getTodayString();
    return this.encounters
      .filter(encounter => encounter.userId === userId && encounter.date === today)
      .map(encounter => encounter.otherUserId);
  }

  /**
   * 今日ログインしているかチェック
   */
  hasLoggedInToday(userId: string): boolean {
    const today = getTodayString();
    return this.logins.some(
      login => login.userId === userId && login.date === today
    );
  }

  /**
   * ユーザーの統計情報を取得
   */
  getUserStats(userId: string): {
    totalEncounters: number;
    todayEncounters: number;
    totalLogins: number;
    loginStreak: number;
  } {
    const totalEncounters = this.encounters.filter(e => e.userId === userId).length;
    const todayEncounters = this.getTodayEncounters(userId).length;
    const totalLogins = this.logins.filter(l => l.userId === userId).length;
    
    // ログイン連続日数の計算
    const userLogins = this.logins
      .filter(l => l.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    let loginStreak = 0;
    let currentDate = new Date();
    
    for (const login of userLogins) {
      const loginDate = new Date(login.timestamp);
      const dayDiff = Math.floor((currentDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === loginStreak) {
        loginStreak++;
        currentDate = loginDate;
      } else {
        break;
      }
    }

    return {
      totalEncounters,
      todayEncounters,
      totalLogins,
      loginStreak
    };
  }

  /**
   * データをシリアライズ
   */
  serialize(): {
    encounters: EncounterRecord[];
    logins: LoginRecord[];
  } {
    return {
      encounters: this.encounters,
      logins: this.logins
    };
  }

  /**
   * データをデシリアライズ
   */
  static deserialize(data: {
    encounters: EncounterRecord[];
    logins: LoginRecord[];
  }): GrowthSystem {
    return new GrowthSystem(data.encounters, data.logins);
  }
}