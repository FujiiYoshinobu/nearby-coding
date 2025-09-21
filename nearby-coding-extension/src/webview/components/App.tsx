import React, { useEffect, useState } from "react";
import { AppState, AvatarType, LevelUpEvent, User, XPEvent } from "../../types";

import Plaza from "./Plaza";
import AvatarSetup from "./AvatarSetup";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: "setup",
    user: {
      id: "",
      name: "Anonymous",
      message: "よろしく！",
      avatar: "🧑‍💻",
      avatarType: AvatarType.HUMAN,
      xp: 0,
      level: 1,
      lastLogin: "",
      lastSeen: 0,
    },
    todayEncounters: new Set<string>(),
    hasLoggedInToday: false,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([]);
  const [xpEvents, setXpEvents] = useState<XPEvent[]>([]);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  useEffect(() => {
    // VS Code APIの取得
    const vscode = window.acquireVsCodeApi();
    (window as any).vscode = vscode;

    // VS Codeからのメッセージを受信
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.command) {
        case "updateUsers":
          setUsers(message.users || []);
          setNewUsers(message.newUsers || []);
          break;

        case "updateAppState":
          setAppState(message.appState);
          break;

        case "xpGained":
          const xpEvent: XPEvent = {
            type: message.eventType,
            amount: message.amount,
            message: message.message,
          };
          setXpEvents((prev) => [...prev, xpEvent]);
          // 3秒後に削除
          setTimeout(() => {
            setXpEvents((prev) => prev.filter((e) => e !== xpEvent));
          }, 3000);
          break;

        case "levelUp":
          const levelUpEvent: LevelUpEvent = {
            newLevel: message.newLevel,
            unlockedAvatars: message.unlockedAvatars || [],
          };
          setLevelUpEvent(levelUpEvent);
          // 5秒後に削除
          setTimeout(() => {
            setLevelUpEvent(null);
          }, 5000);
          break;
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  const handleSetupComplete = (userData: {
    name: string;
    message: string;
    avatarType: AvatarType;
  }) => {
    const vscode = (window as any).vscode;
    vscode.postMessage({
      command: "setupComplete",
      userData,
    });
  };

  const handleBackToSetup = () => {
    setAppState((prev) => ({ ...prev, currentScreen: "setup" }));
  };

  if (appState.currentScreen === "setup") {
    return (
      <AvatarSetup user={appState.user} onComplete={handleSetupComplete} />
    );
  }

  return (
    <Plaza
      users={users}
      newUsers={newUsers}
      user={appState.user}
      xpEvents={xpEvents}
      levelUpEvent={levelUpEvent}
      onBackToSetup={handleBackToSetup}
    />
  );
};

export default App;
