import React, { useEffect, useState } from "react";
import { User } from "./App";

interface VisitorProps {
  user: User;
  onExit: () => void;
}

const Visitor: React.FC<VisitorProps> = ({ user, onExit }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [topPosition] = useState(() => 10 + Math.random() * 60); // ランダムな高さ

  useEffect(() => {
    // 退場アニメーション開始のタイミングを設定
    const exitDelay = 4000 + Math.random() * 2000; // 4-6秒後

    const exitTimer = setTimeout(() => {
      setIsLeaving(true);
      // アニメーション完了後にコンポーネントを削除
      setTimeout(() => {
        onExit();
      }, 1000);
    }, exitDelay);

    return () => clearTimeout(exitTimer);
  }, [onExit]);

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div
      className={`visitor ${isLeaving ? "leaving" : ""}`}
      style={{ top: `${topPosition}%` }}
    >
      <div className="message-bubble">
        <strong>{escapeHtml(user.name)}:</strong> {escapeHtml(user.message)}
      </div>
      <div className="avatar">{escapeHtml(user.avatar)}</div>
    </div>
  );
};

export default Visitor;
