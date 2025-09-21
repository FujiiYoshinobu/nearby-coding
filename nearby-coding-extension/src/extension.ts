import * as vscode from 'vscode';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

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
    const webviewJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionContext.extensionUri, 'dist', 'webview.js'));
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline'; connect-src https:;">
    <title>Nearby Coding</title>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${webviewJsUri}"></script>
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