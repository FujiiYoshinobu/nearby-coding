export const mockUsers = [
  {
    id: 'user-123',
    name: 'Alice',
    message: 'Hello everyone!',
    avatar: '👩‍💻',
    lastSeen: Date.now() - 1000
  },
  {
    id: 'user-456',
    name: 'Bob',
    message: 'Working on React components',
    avatar: '🧑‍💻',
    lastSeen: Date.now() - 2000
  },
  {
    id: 'user-789',
    name: 'Charlie',
    message: 'Great to see you all!',
    avatar: '👨‍💻',
    lastSeen: Date.now() - 3000
  }
];

// VS Code webview API のモック（開発サーバー用）
export const mockVsCodeApi = {
  postMessage: (message: any) => {
    console.log('Mock VS Code API - Sending message:', message);
  },
  setState: (state: any) => {
    console.log('Mock VS Code API - Setting state:', state);
  },
  getState: () => {
    console.log('Mock VS Code API - Getting state');
    return {};
  }
};

// 開発環境でのメッセージシミュレーション
export const simulateVsCodeMessages = (callback: (event: MessageEvent) => void) => {
  // 初期メッセージ
  setTimeout(() => {
    callback({
      data: {
        command: 'updateUsers',
        users: mockUsers,
        newUsers: [mockUsers[0]], // 最初のユーザーを新規として
        selfId: 'self-user',
        selfAvatar: '🚀'
      }
    } as MessageEvent);
  }, 1000);

  // 追加のユーザーを定期的に送信
  let userIndex = 1;
  setInterval(() => {
    if (userIndex < mockUsers.length) {
      callback({
        data: {
          command: 'updateUsers',
          users: mockUsers.slice(0, userIndex + 1),
          newUsers: [mockUsers[userIndex]],
          selfId: 'self-user',
          selfAvatar: '🚀'
        }
      } as MessageEvent);
      userIndex++;
    }
  }, 5000);
};