import React, { useState } from "react";
import {
  AVATAR_CONFIG,
  AvatarType,
  getUnlockedAvatars,
  User,
} from "../../types";

interface AvatarSetupProps {
  user: User;
  onComplete: (userData: {
    name: string;
    message: string;
    avatarType: AvatarType;
  }) => void;
}

const AvatarSetup: React.FC<AvatarSetupProps> = ({ user, onComplete }) => {
  const [name, setName] = useState(user.name);
  const [message, setMessage] = useState(user.message);
  const [selectedAvatarType, setSelectedAvatarType] = useState(user.avatarType);
  const [isAnimating, setIsAnimating] = useState(true); // 常にアニメーション開始

  const unlockedAvatars = getUnlockedAvatars(user.level);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: name.trim() || "Anonymous",
      message: message.trim() || "よろしく！",
      avatarType: selectedAvatarType,
    });
  };

  const handleAvatarPreview = () => {
    // アニメーションを一時停止して再開（強調効果）
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  return (
    <div className="avatar-setup">
      <div className="setup-container">
        <h1 className="setup-title">出社アバター設定</h1>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="name">名前</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="あなたの名前"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">一言コメント</label>
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="挨拶メッセージ"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>アバタータイプ</label>
            <div className="avatar-selection">
              {Object.entries(AVATAR_CONFIG).map(([type, config]) => {
                const isUnlocked = unlockedAvatars.includes(type as AvatarType);
                const isSelected = selectedAvatarType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    className={`avatar-option ${isSelected ? "selected" : ""} ${
                      !isUnlocked ? "locked" : ""
                    }`}
                    onClick={() =>
                      isUnlocked && setSelectedAvatarType(type as AvatarType)
                    }
                    disabled={!isUnlocked}
                    title={
                      !isUnlocked
                        ? `レベル${config.unlockLevel}で解放`
                        : config.name
                    }
                  >
                    <span className="avatar-emoji">{config.emoji}</span>
                    <span className="avatar-name">{config.name}</span>
                    {!isUnlocked && (
                      <span className="unlock-level">
                        Lv.{config.unlockLevel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="preview-section">
            <h3>プレビュー</h3>
            <div className="avatar-preview">
              <span
                className={`preview-avatar ${isAnimating ? "bouncing" : ""}`}
                onClick={handleAvatarPreview}
              >
                {AVATAR_CONFIG[selectedAvatarType].emoji}
              </span>
              <div className="preview-info">
                <div className="preview-name">{name || "Anonymous"}</div>
                <div className="preview-message">
                  "{message || "よろしく！"}"
                </div>
                <div className="preview-level">
                  レベル {user.level} (XP: {user.xp})
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="start-button">
            スタート
          </button>
        </form>
      </div>
    </div>
  );
};

export default AvatarSetup;
