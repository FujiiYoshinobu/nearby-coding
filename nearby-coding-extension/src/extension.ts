import * as vscode from 'vscode';
import { GrowthSystem } from './GrowthSystem';
import { AppState, AVATAR_CONFIG, AvatarType, User } from './types';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
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
  private _growthSystem: GrowthSystem;
  private _appState: AppState;

  constructor(private readonly _extensionContext: vscode.ExtensionContext) {
    this._context = _extensionContext;
    
    // ユーザーIDを取得または生成
    this._userId = this._context.globalState.get('nearbyCoding.userId') || this._generateUserId();
    this._context.globalState.update('nearbyCoding.userId', this._userId);
    
    // 成長システムの初期化
    const growthData = this._context.globalState.get('nearbyCoding.growthData');
    this._growthSystem = growthData ? 
      GrowthSystem.deserialize(growthData as { encounters: any[]; logins: any[] }) : 
      new GrowthSystem();
    
    // アプリケーション状態の初期化
    this._appState = this._loadAppState();
  }

  private _generateUserId(): string {
    return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  private _loadAppState(): AppState {
    const savedUser = this._context.globalState.get<User>('nearbyCoding.user');
    const config = this._getConfiguration();
    
    const defaultUser: User = {
      id: this._userId,
      name: config.name,
      message: config.message,
      avatar: config.avatar,
      avatarType: AvatarType.HUMAN,
      xp: 0,
      level: 1,
      lastLogin: '',
      lastSeen: 0
    };

    const user = savedUser ? { ...defaultUser, ...savedUser } : defaultUser;
    
    return {
      currentScreen: savedUser ? 'plaza' : 'setup',
      user,
      todayEncounters: new Set<string>(),
      hasLoggedInToday: this._growthSystem.hasLoggedInToday(this._userId)
    };
  }

  private _saveAppState(): void {
    this._context.globalState.update('nearbyCoding.user', this._appState.user);
    this._context.globalState.update('nearbyCoding.growthData', this._growthSystem.serialize());
  }

  private _handleSetupComplete(userData: { name: string; message: string; avatarType: AvatarType }): void {
    // ユーザー情報を更新
    this._appState.user = {
      ...this._appState.user,
      name: userData.name,
      message: userData.message,
      avatarType: userData.avatarType,
      avatar: AVATAR_CONFIG[userData.avatarType].emoji
    };
    
    this._appState.currentScreen = 'plaza';
    this._saveAppState();
    
    // 設定も更新
    const config = vscode.workspace.getConfiguration('nearbyCoding');
    config.update('name', userData.name, vscode.ConfigurationTarget.Global);
    config.update('message', userData.message, vscode.ConfigurationTarget.Global);
    config.update('avatar', AVATAR_CONFIG[userData.avatarType].emoji, vscode.ConfigurationTarget.Global);
    
    // ログイン処理
    this._processLogin();
    
    // Webviewに状態を送信
    this._sendAppStateToWebview();
  }

  private _processLogin(): void {
    // 新しい仕様では、_sendLoginメソッドでログイン処理を統合
    // この関数は互換性のために残すが、実際の処理は_sendLoginで行う
    this._sendLogin();
  }

  private _sendAppStateToWebview(): void {
    if (!this._view) return;
    
    this._view.webview.postMessage({
      command: 'updateAppState',
      appState: this._appState
    });
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
    
    // Webviewからのメッセージを処理
    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'setupComplete':
            this._handleSetupComplete(message.userData);
            break;
        }
      },
      undefined,
      this._context.subscriptions
    );
    
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

    // 初期状態を送信
    this._sendAppStateToWebview();
    
    // ログイン処理
    if (this._appState.currentScreen === 'plaza') {
      this._processLogin();
    }

    // ビューが表示されたら開始
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

  private async _sendLogin() {
    if (this._disposed) return;
    
    const config = this._getConfiguration();
    
    try {
      const response = await fetch(config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          id: this._userId,
          name: this._appState.user.name,
          message: this._appState.user.message,
          avatar: this._appState.user.avatar,
          avatarType: this._appState.user.avatarType
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // サーバーからのレスポンスでユーザー情報を更新
          this._appState.user = result.user;
          this._saveAppState();
          
          // XPイベントの処理
          if (result.loginXP > 0) {
            this._view?.webview.postMessage({
              command: 'xpGained',
              eventType: 'login',
              amount: result.loginXP,
              message: '出社！'
            });
          }
          
          // レベルアップの処理
          if (result.levelUp) {
            this._view?.webview.postMessage({
              command: 'levelUp',
              newLevel: result.newLevel,
              unlockedAvatars: []  // TODO: サーバーから取得
            });
          }
          
          // 遭遇XPの処理
          if (result.encounters && result.encounters.length > 0) {
            for (const encounter of result.encounters) {
              this._view?.webview.postMessage({
                command: 'xpGained',
                eventType: 'encounter',
                amount: encounter.xpGained,
                message: `${encounter.user.name}と遭遇！`
              });
            }
          }
          
          // 今日のユーザー一覧を更新
          this._view?.webview.postMessage({
            command: 'updateUsers',
            users: result.todayUsers || [],
            newUsers: result.todayUsers || []
          });
        }
      } else {
        console.warn('Nearby Coding: Login failed', response.status);
      }
    } catch (error) {
      console.warn('Nearby Coding: Login error', error);
    }
  }

  private async _fetchUsers() {
    if (this._disposed || !this._view) return;
    
    const config = this._getConfiguration();
    // /users エンドポイントを使用
    const usersUrl = config.serverUrl.replace('/api/nearby', '/api/users');
    
    try {
      const response = await fetch(usersUrl, {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.users) {
          // 新規ユーザーまたは再参加ユーザーを検知と遭遇処理
          const newUsers: User[] = [];
          const currentTime = Date.now();
          
          result.users.forEach((user: User) => {
            if (user.id !== this._userId) {
              const lastSeen = this._lastSeenUsers.get(user.id) || 0;
              // 初回参加、または5分以上経過後の再参加
              if (!lastSeen || (currentTime - lastSeen) > 300000) {
                newUsers.push(user);
                
                // 遭遇処理
                this._processEncounter(user.id);
              }
              this._lastSeenUsers.set(user.id, currentTime);
            }
          });
          
          // Webviewにユーザー情報を送信
          this._view.webview.postMessage({
            command: 'updateUsers',
            users: result.users,
            newUsers: newUsers
          });
        }
      }
    } catch (error) {
      console.warn('Nearby Coding: Fetch users error', error);
    }
  }

  private async _processEncounter(otherUserId: string): Promise<void> {
    if (this._disposed) return;
    
    const config = this._getConfiguration();
    
    try {
      const response = await fetch(config.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'encounter',
          id: this._userId,
          encounterUserId: otherUserId
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.xpGained > 0) {
          // ユーザー情報を更新
          this._appState.user = result.user;
          this._appState.todayEncounters.add(otherUserId);
          this._saveAppState();
          
          // XP獲得をWebviewに通知
          this._view?.webview.postMessage({
            command: 'xpGained',
            eventType: 'encounter',
            amount: result.xpGained,
            message: '遭遇！'
          });
          
          // レベルアップした場合
          if (result.levelUp) {
            this._view?.webview.postMessage({
              command: 'levelUp',
              newLevel: result.newLevel,
              unlockedAvatars: [] // TODO: サーバーから取得
            });
          }
        }
      }
    } catch (error) {
      console.warn('Nearby Coding: Encounter error', error);
    }
  }

  private _startLoops() {
    this._stopLoops();
    
    // 初回ログイン
    this._sendLogin();
    
    // 10秒ごとにユーザー情報を更新
    this._postInterval = setInterval(() => {
      this._sendLogin();
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
    
    // 現在の設定でアプリ状態を更新
    this._sendAppStateToWebview();
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