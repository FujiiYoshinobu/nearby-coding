import React, { useEffect, useState } from "react";
import Plaza from "./Plaza";

export interface User {
  id: string;
  name: string;
  message: string;
  avatar: string;
  lastSeen: number;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsers, setNewUsers] = useState<User[]>([]);
  const [selfId, setSelfId] = useState<string>("");
  const [selfAvatar, setSelfAvatar] = useState<string>("🧑‍💻");

  useEffect(() => {
    // VS Code APIの取得
    const vscode = window.acquireVsCodeApi();

    // VS Codeからのメッセージを受信
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.command) {
        case "updateUsers":
          setUsers(message.users || []);
          setNewUsers(message.newUsers || []);
          setSelfId(message.selfId || "");
          if (message.selfAvatar) {
            setSelfAvatar(message.selfAvatar);
          }
          break;
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <Plaza
      users={users}
      newUsers={newUsers}
      selfId={selfId}
      selfAvatar={selfAvatar}
    />
  );
};

export default App;
