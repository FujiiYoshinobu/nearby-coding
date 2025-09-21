import React, { useEffect, useRef, useState } from "react";
import { AVATAR_CONFIG, LevelUpEvent, User, XPEvent } from "../../types";
import Visitor from "./Visitor";

interface PlazaProps {
  users: User[];
  newUsers: User[];
  user: User;
  xpEvents: XPEvent[];
  levelUpEvent: LevelUpEvent | null;
  onBackToSetup: () => void;
}

const Plaza: React.FC<PlazaProps> = ({
  users,
  newUsers,
  user,
  xpEvents,
  levelUpEvent,
  onBackToSetup,
}) => {
  const [activeVisitors, setActiveVisitors] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // 新規ユーザーまたは再参加ユーザーのみを表示
    newUsers.forEach((visitingUser) => {
      if (visitingUser.id !== user.id && !activeVisitors.has(visitingUser.id)) {
        showVisitor(visitingUser);
      }
    });
  }, [newUsers, user.id]);

  const showVisitor = (user: User) => {
    // 既に表示中の場合はスキップ
    if (activeVisitors.has(user.id)) {
      return;
    }

    setActiveVisitors((prev) => new Set(prev).add(user.id));

    // 5-7秒後に退場
    const exitTime = 5000 + Math.random() * 2000;
    const timeoutId = setTimeout(() => {
      hideVisitor(user.id);
    }, exitTime);

    timeoutsRef.current.set(user.id, timeoutId);
  };

  const hideVisitor = (userId: string) => {
    setActiveVisitors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });

    // タイムアウトをクリア
    const timeoutId = timeoutsRef.current.get(userId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(userId);
    }
  };

  // コンポーネントのアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  return (
    <div className="plaza">
      {/* ヘッダー部分 */}
      <div className="plaza-header">
        <button className="back-button" onClick={onBackToSetup}>
          ⚙️ 設定
        </button>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-level">Lv.{user.level}</span>
          <span className="user-xp">XP: {user.xp}</span>
        </div>
      </div>

      {/* XPイベント表示 */}
      <div className="xp-events">
        {xpEvents.map((event, index) => (
          <div key={index} className={`xp-popup ${event.type}`}>
            +{event.amount}XP {event.message}
          </div>
        ))}
      </div>

      {/* レベルアップ通知 */}
      {levelUpEvent && (
        <div className="level-up-notification">
          <div className="level-up-content">
            <h2>🎉 LEVEL UP! 🎉</h2>
            <p>レベル {levelUpEvent.newLevel} になりました！</p>
            {levelUpEvent.unlockedAvatars.length > 0 && (
              <div className="unlocked-avatars">
                <p>新しいアバターが解放されました:</p>
                {levelUpEvent.unlockedAvatars.map((avatarType) => (
                  <span key={avatarType} className="unlocked-avatar">
                    {AVATAR_CONFIG[avatarType].emoji}{" "}
                    {AVATAR_CONFIG[avatarType].name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* レーン表示 */}
      <div className="lane"></div>
      <div className="lane"></div>
      <div className="lane"></div>

      {/* 自分のアバター - 中央付近で上下に揺れながら歩行アニメ */}
      <div className="self-avatar walking bouncing">
        <div className="avatar-character">
          {AVATAR_CONFIG[user.avatarType].emoji}
        </div>
        <div className="avatar-shadow"></div>
      </div>

      {/* アクティブなビジターを表示 */}
      {users
        .filter(
          (visitingUser) =>
            visitingUser.id !== user.id && activeVisitors.has(visitingUser.id)
        )
        .map((visitingUser) => (
          <Visitor
            key={visitingUser.id}
            user={visitingUser}
            onExit={() => hideVisitor(visitingUser.id)}
          />
        ))}
    </div>
  );
};

export default Plaza;
