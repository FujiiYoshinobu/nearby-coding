import React, { useEffect, useState } from "react";
import { AVATAR_CONFIG, User } from "../../types";

interface VisitorProps {
  user: User;
  onExit: () => void;
}

const Visitor: React.FC<VisitorProps> = ({ user, onExit }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [topPosition] = useState(() => 20 + Math.random() * 40); // ランダムな高さ

  useEffect(() => {
    // 入場後すぐにメッセージ表示
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 500);

    // 1-2秒後にメッセージをフェードアウト
    const messageHideTimer = setTimeout(() => {
      setShowMessage(false);
    }, 2500);

    // 退場アニメーション開始のタイミングを設定
    const exitDelay = 4000 + Math.random() * 2000; // 4-6秒後

    const exitTimer = setTimeout(() => {
      setIsLeaving(true);
      // アニメーション完了後にコンポーネントを削除
      setTimeout(() => {
        onExit();
      }, 1000);
    }, exitDelay);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(messageHideTimer);
      clearTimeout(exitTimer);
    };
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
      {showMessage && (
        <div className="message-bubble">
          <strong>{escapeHtml(user.name)}:</strong> {escapeHtml(user.message)}
        </div>
      )}
      <div className="avatar bouncing">
        {AVATAR_CONFIG[user.avatarType].emoji}
      </div>
    </div>
  );
};

export default Visitor;
