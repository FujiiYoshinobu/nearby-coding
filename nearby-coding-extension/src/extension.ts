import * as vscode from 'vscode';

interface User {
  id: string;
  name: string;
  message: string;
  avatar: string;
  lastSeen: number;
}

export class NearbyCodingViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'nearbyCoding.plaza';
  
  private _view?: vscode.WebviewView;
  private _context: vscode.ExtensionContext;
  private _userId: string;
  private _postInterval?: any;
  private _getInterval?: any;
  private _disposed = false;
  private _lastSeenUsers = new Map<string, number>(); // ユーザーIDと最後に見た時刻を記録

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    this._context = _extensionContext;
    
    // ユーザーIDを取得または生成
    this._userId = this._context.globalState.get('nearbyCoding.userId') || this._generateUserId();
    this._context.globalState.update('nearbyCoding.userId', this._userId);
  }

  private _generateUserId(): string {
    return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionContext.extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    
    // 設定変更時の処理
    this._context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('nearbyCoding')) {
          // 設定変更時は即座にWebviewを更新してからループを再開
          this._updateWebviewWithCurrentConfig();
          this._restartLoops();
        }
      })
    );

    // ビューが表示されたら初期設定を反映してから開始
    this._updateWebviewWithCurrentConfig();
    this._startLoops();

    // Webviewが破棄される時のクリーンアップ
    webviewView.onDidDispose(() => {
      this._stopLoops();
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nearby Coding</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #141414;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: 100vh;
            overflow: hidden;
            position: relative;
        }
        
        .plaza {
            width: 100%;
            height: 100vh;
            position: relative;
            background: linear-gradient(180deg, #141414 0%, #1e1e1e 100%);
        }
        
        .self-avatar {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 2em;
            z-index: 100;
        }
        
        .visitor {
            position: absolute;
            right: -100px;
            top: 20%;
            animation: slideIn 1s ease-in-out forwards;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 50;
        }
        
        .visitor.leaving {
            animation: slideOut 1s ease-in-out forwards;
        }
        
        .avatar {
            font-size: 1.5em;
        }
        
        .message-bubble {
            background-color: white;
            color: #333;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        @keyframes slideIn {
            0% { 
                right: -200px; 
                opacity: 0;
                transform: translateY(20px);
            }
            50% { 
                right: 20px; 
                opacity: 1;
                transform: translateY(0);
            }
            100% { 
                right: 30px; 
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            0% { 
                right: 30px; 
                opacity: 1;
            }
            100% { 
                right: -200px; 
                opacity: 0;
                transform: translateY(-20px);
            }
        }
        
        .lane {
            position: absolute;
            width: 100%;
            height: 60px;
            background-color: rgba(30, 30, 30, 0.3);
            border-radius: 8px;
        }
        
        .lane:nth-child(1) { top: 15%; }
        .lane:nth-child(2) { top: 35%; }
        .lane:nth-child(3) { top: 55%; }
    </style>
</head>
<body>
    <div class="plaza">
        <div class="lane"></div>
        <div class="lane"></div>
        <div class="lane"></div>
        
        <div class="self-avatar" id="selfAvatar">🧑‍💻</div>
    </div>

    <script>
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        
        let activeVisitors = new Set();
        let lastSeenUsers = new Map();
        
        function showVisitor(user) {
            // 既に表示中の場合はスキップ
            if (activeVisitors.has(user.id)) {
                return;
            }
            
            const visitor = document.createElement('div');
            visitor.className = 'visitor';
            visitor.id = 'visitor-' + user.id;
            
            // ランダムな高さに配置
            const topPercent = 10 + Math.random() * 60;
            visitor.style.top = topPercent + '%';
            
            visitor.innerHTML = \`
                <div class="message-bubble">
                    <strong>\${escapeHtml(user.name)}:</strong> \${escapeHtml(user.message)}
                </div>
                <div class="avatar">\${escapeHtml(user.avatar)}</div>
            \`;
            
            document.querySelector('.plaza').appendChild(visitor);
            activeVisitors.add(user.id);
            
            // 5-7秒後に退場
            const exitTime = 5000 + Math.random() * 2000;
            setTimeout(() => {
                if (document.getElementById('visitor-' + user.id)) {
                    visitor.classList.add('leaving');
                    setTimeout(() => {
                        if (visitor.parentNode) {
                            visitor.parentNode.removeChild(visitor);
                        }
                        activeVisitors.delete(user.id);
                    }, 1000);
                }
            }, exitTime);
        }
        
        // VSCodeからのメッセージを受信
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'updateUsers':
                    // 自分のアバターを更新
                    if (message.selfAvatar) {
                        document.getElementById('selfAvatar').textContent = message.selfAvatar;
                    }
                    
                    // 新規ユーザーまたは再参加ユーザーのみを挨拶表示
                    if (message.newUsers && message.newUsers.length > 0) {
                        message.newUsers.forEach(user => {
                            if (user.id !== message.selfId && !activeVisitors.has(user.id)) {
                                showVisitor(user);
                            }
                        });
                    }
                    break;
            }
        });
    </script>
</body>
</html>`;
  }

  private _getConfiguration() {
    const config = vscode.workspace.getConfiguration('nearbyCoding');
    let serverUrl = config.get<string>('serverUrl', 'https://nearby-coding-server-i3mbz1w0s-fujii-yoshinobus-projects.vercel.app');
    
    // serverUrl が /api/nearby で終わっていない場合は追加
    if (!serverUrl.endsWith('/api/nearby')) {
      serverUrl = serverUrl.replace(/\/$/, '') + '/api/nearby';
    }
    
    return {
      serverUrl: serverUrl,
      name: config.get<string>('name', 'Anonymous'),
      message: config.get<string>('message', 'よろしく！'),
      avatar: config.get<string>('avatar', '🧑‍💻')
    };
  }

  private async _sendPing() {
    if (this._disposed) return;
    
    const config = this._getConfiguration();
    
    try {
      const response = await fetch(config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this._userId,
          name: config.name,
          message: config.message,
          avatar: config.avatar
        })
      });

      if (!response.ok) {
        console.warn('Nearby Coding: Ping failed', response.status);
      }
    } catch (error) {
      console.warn('Nearby Coding: Ping error', error);
    }
  }

  private async _fetchUsers() {
    if (this._disposed || !this._view) return;
    
    const config = this._getConfiguration();
    
    try {
      const response = await fetch(config.serverUrl, {
        method: 'GET'
      });

      if (response.ok) {
        const users: User[] = await response.json();
        
        // 新規ユーザーまたは再参加ユーザーを検知
        const newUsers: User[] = [];
        const currentTime = Date.now();
        
        users.forEach(user => {
          if (user.id !== this._userId) {
            const lastSeen = this._lastSeenUsers.get(user.id) || 0;
            // 初回参加、または5分以上経過後の再参加
            if (!lastSeen || (currentTime - lastSeen) > 300000) {
              newUsers.push(user);
            }
            this._lastSeenUsers.set(user.id, currentTime);
          }
        });
        
        // Webviewにユーザー情報を送信
        this._view.webview.postMessage({
          command: 'updateUsers',
          users: users,
          newUsers: newUsers,
          selfId: this._userId,
          selfAvatar: config.avatar
        });
      }
    } catch (error) {
      console.warn('Nearby Coding: Fetch users error', error);
    }
  }

  private _startLoops() {
    this._stopLoops();
    
    // 初回ping
    this._sendPing();
    
    // 10秒ごとにPOST
    this._postInterval = setInterval(() => {
      this._sendPing();
    }, 10000);
    
    // 6秒ごとにGET
    this._getInterval = setInterval(() => {
      this._fetchUsers();
    }, 6000);
    
    // 初回fetch
    setTimeout(() => {
      this._fetchUsers();
    }, 1000);
  }

  private _stopLoops() {
    if (this._postInterval) {
      clearInterval(this._postInterval);
      this._postInterval = undefined;
    }
    if (this._getInterval) {
      clearInterval(this._getInterval);
      this._getInterval = undefined;
    }
  }

  private _updateWebviewWithCurrentConfig() {
    if (!this._view) return;
    
    const config = this._getConfiguration();
    
    // 即座に現在の設定でWebviewを更新
    this._view.webview.postMessage({
      command: 'updateUsers',
      users: [],
      selfId: this._userId,
      selfAvatar: config.avatar
    });
  }

  private _restartLoops() {
    this._stopLoops();
    this._startLoops();
  }

  public dispose() {
    this._disposed = true;
    this._stopLoops();
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new NearbyCodingViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      NearbyCodingViewProvider.viewType, 
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );
}

export function deactivate() {
  // クリーンアップは自動的に行われる
}