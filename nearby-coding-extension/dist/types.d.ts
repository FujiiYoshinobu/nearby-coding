export interface User {
    id: string;
    name: string;
    message: string;
    avatar: string;
    avatarType: AvatarType;
    xp: number;
    level: number;
    lastLogin: string;
    lastSeen: number;
}
export interface EncounterRecord {
    userId: string;
    otherUserId: string;
    date: string;
}
export interface LoginRecord {
    userId: string;
    timestamp: number;
    date: string;
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
export declare enum AvatarType {
    HUMAN = "human",
    CAT = "cat",
    ROBOT = "robot",
    WIZARD = "wizard",
    DRAGON = "dragon",
    BUG = "bug"
}
export declare const AVATAR_CONFIG: Record<AvatarType, {
    emoji: string;
    unlockLevel: number;
    name: string;
}>;
export declare const calculateRequiredXP: (level: number) => number;
export declare const calculateLevel: (xp: number) => number;
export declare const getUnlockedAvatars: (level: number) => AvatarType[];
export declare const getNewlyUnlockedAvatars: (oldLevel: number, newLevel: number) => AvatarType[];
export declare const getTodayString: () => string;
export declare const isToday: (dateString: string) => boolean;
