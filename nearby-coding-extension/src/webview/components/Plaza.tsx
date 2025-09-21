import React, { useEffect, useRef, useState } from "react";
import { User } from "./App";
import Visitor from "./Visitor";

interface PlazaProps {
  users: User[];
  newUsers: User[];
  selfId: string;
  selfAvatar: string;
}

const Plaza: React.FC<PlazaProps> = ({
  users,
  newUsers,
  selfId,
  selfAvatar,
}) => {
  const [activeVisitors, setActiveVisitors] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // 新規ユーザーまたは再参加ユーザーのみを表示
    newUsers.forEach((user) => {
      if (user.id !== selfId && !activeVisitors.has(user.id)) {
        showVisitor(user);
      }
    });
  }, [newUsers, selfId]);

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
      <div className="lane"></div>
      <div className="lane"></div>
      <div className="lane"></div>
      <div className="self-avatar">{selfAvatar}</div>

      {/* アクティブなビジターを表示 */}
      {users
        .filter((user) => user.id !== selfId && activeVisitors.has(user.id))
        .map((user) => (
          <Visitor
            key={user.id}
            user={user}
            onExit={() => hideVisitor(user.id)}
          />
        ))}
    </div>
  );
};

export default Plaza;
