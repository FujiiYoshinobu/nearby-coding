/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = exports.NearbyCodingViewProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
class NearbyCodingViewProvider {
    constructor(_extensionContext) {
        this._extensionContext = _extensionContext;
        this._disposed = false;
        this._lastSeenUsers = new Map(); // ユーザーIDと最後に見た時刻を記録
        this._context = _extensionContext;
        // ユーザーIDを取得または生成
        this._userId = this._context.globalState.get('nearbyCoding.userId') || this._generateUserId();
        this._context.globalState.update('nearbyCoding.userId', this._userId);
    }
    _generateUserId() {
        return 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }
    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionContext.extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // 設定変更時の処理
        this._context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('nearbyCoding')) {
                // 設定変更時は即座にWebviewを更新してからループを再開
                this._updateWebviewWithCurrentConfig();
                this._restartLoops();
            }
        }));
        // ビューが表示されたら初期設定を反映してから開始
        this._updateWebviewWithCurrentConfig();
        this._startLoops();
        // Webviewが破棄される時のクリーンアップ
        webviewView.onDidDispose(() => {
            this._stopLoops();
        });
    }
    _getHtmlForWebview(webview) {
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
    _getConfiguration() {
        const config = vscode.workspace.getConfiguration('nearbyCoding');
        let serverUrl = config.get('serverUrl', 'https://nearby-coding-server-i3mbz1w0s-fujii-yoshinobus-projects.vercel.app');
        // serverUrl が /api/nearby で終わっていない場合は追加
        if (!serverUrl.endsWith('/api/nearby')) {
            serverUrl = serverUrl.replace(/\/$/, '') + '/api/nearby';
        }
        return {
            serverUrl: serverUrl,
            name: config.get('name', 'Anonymous'),
            message: config.get('message', 'よろしく！'),
            avatar: config.get('avatar', '🧑‍💻')
        };
    }
    async _sendPing() {
        if (this._disposed)
            return;
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
        }
        catch (error) {
            console.warn('Nearby Coding: Ping error', error);
        }
    }
    async _fetchUsers() {
        if (this._disposed || !this._view)
            return;
        const config = this._getConfiguration();
        try {
            const response = await fetch(config.serverUrl, {
                method: 'GET'
            });
            if (response.ok) {
                const users = await response.json();
                // 新規ユーザーまたは再参加ユーザーを検知
                const newUsers = [];
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
        }
        catch (error) {
            console.warn('Nearby Coding: Fetch users error', error);
        }
    }
    _startLoops() {
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
    _stopLoops() {
        if (this._postInterval) {
            clearInterval(this._postInterval);
            this._postInterval = undefined;
        }
        if (this._getInterval) {
            clearInterval(this._getInterval);
            this._getInterval = undefined;
        }
    }
    _updateWebviewWithCurrentConfig() {
        if (!this._view)
            return;
        const config = this._getConfiguration();
        // 即座に現在の設定でWebviewを更新
        this._view.webview.postMessage({
            command: 'updateUsers',
            users: [],
            selfId: this._userId,
            selfAvatar: config.avatar
        });
    }
    _restartLoops() {
        this._stopLoops();
        this._startLoops();
    }
    dispose() {
        this._disposed = true;
        this._stopLoops();
    }
}
exports.NearbyCodingViewProvider = NearbyCodingViewProvider;
NearbyCodingViewProvider.viewType = 'nearbyCoding.plaza';
function activate(context) {
    const provider = new NearbyCodingViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(NearbyCodingViewProvider.viewType, provider, { webviewOptions: { retainContextWhenHidden: true } }));
}
exports.activate = activate;
function deactivate() {
    // クリーンアップは自動的に行われる
}
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map