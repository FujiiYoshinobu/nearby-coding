// 出社アバター機能のタイプ定義

export interface User {
  id: string;
  name: string;
  message: string;
  avatar: string;
  avatarType: AvatarType;
  xp: number;
  level: number;
  lastLogin: string; // ISO date string
  lastSeen: number; // timestamp for compatibility
}

export interface EncounterRecord {
  userId: string;
  otherUserId: string;
  date: string; // YYYY-MM-DD format
}

export interface LoginRecord {
  userId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD format
}

export interface XPEvent {
  type: 'login' | 'encounter';
  amount: number;
  message: string;
}

export interface LevelUpEvent {
  newLevel: number;
  unlockedAvatars: AvatarType[];
}

export interface AppState {
  currentScreen: 'setup' | 'plaza';
  user: User;
  todayEncounters: Set<string>;
  hasLoggedInToday: boolean;
}

// アバタータイプの定義
export enum AvatarType {
  HUMAN = 'human',
  CAT = 'cat', 
  ROBOT = 'robot',
  WIZARD = 'wizard',
  DRAGON = 'dragon',
  BUG = 'bug'
}

// アバターの表示文字とレベル制限
export const AVATAR_CONFIG: Record<AvatarType, { emoji: string; unlockLevel: number; name: string }> = {
  [AvatarType.HUMAN]: { emoji: '🧑‍💻', unlockLevel: 1, name: '人' },
  [AvatarType.CAT]: { emoji: '🐱', unlockLevel: 2, name: '猫' },
  [AvatarType.ROBOT]: { emoji: '🤖', unlockLevel: 3, name: 'ロボット' },
  [AvatarType.WIZARD]: { emoji: '🧙‍♂️', unlockLevel: 5, name: '魔法使い' },
  [AvatarType.DRAGON]: { emoji: '🐉', unlockLevel: 10, name: 'ドラゴン' },
  [AvatarType.BUG]: { emoji: '🐛', unlockLevel: 10, name: 'バグ' }
};

// XP・レベル計算関数
export const calculateRequiredXP = (level: number): number => {
  return 50 * level * level;
};

export const calculateLevel = (xp: number): number => {
  let level = 1;
  while (calculateRequiredXP(level + 1) <= xp) {
    level++;
  }
  return level;
};

export const getUnlockedAvatars = (level: number): AvatarType[] => {
  return Object.entries(AVATAR_CONFIG)
    .filter(([_, config]) => config.unlockLevel <= level)
    .map(([type]) => type as AvatarType);
};

export const getNewlyUnlockedAvatars = (oldLevel: number, newLevel: number): AvatarType[] => {
  const oldUnlocked = getUnlockedAvatars(oldLevel);
  const newUnlocked = getUnlockedAvatars(newLevel);
  return newUnlocked.filter(avatar => !oldUnlocked.includes(avatar));
};

// 日付ユーティリティ
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};