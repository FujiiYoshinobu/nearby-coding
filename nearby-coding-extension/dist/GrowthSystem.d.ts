import { AvatarType, EncounterRecord, LoginRecord, User } from './types';
/**
 * 出社アバター機能の成長システムを管理するクラス
 */
export declare class GrowthSystem {
    private encounters;
    private logins;
    constructor(encounters?: EncounterRecord[], logins?: LoginRecord[]);
    /**
     * ログイン処理とXP付与
     */
    processLogin(user: User): {
        xpGained: number;
        levelUp: boolean;
        newLevel: number;
        unlockedAvatars: AvatarType[];
    };
    /**
     * 遭遇処理とXP付与
     */
    processEncounter(user: User, otherUserId: string): {
        xpGained: number;
        levelUp: boolean;
        newLevel: number;
        unlockedAvatars: AvatarType[];
    };
    /**
     * XP追加とレベルアップ判定
     */
    private addXP;
    /**
     * 今日の遭遇リストを取得
     */
    getTodayEncounters(userId: string): string[];
    /**
     * 今日ログインしているかチェック
     */
    hasLoggedInToday(userId: string): boolean;
    /**
     * ユーザーの統計情報を取得
     */
    getUserStats(userId: string): {
        totalEncounters: number;
        todayEncounters: number;
        totalLogins: number;
        loginStreak: number;
    };
    /**
     * データをシリアライズ
     */
    serialize(): {
        encounters: EncounterRecord[];
        logins: LoginRecord[];
    };
    /**
     * データをデシリアライズ
     */
    static deserialize(data: {
        encounters: EncounterRecord[];
        logins: LoginRecord[];
    }): GrowthSystem;
}
