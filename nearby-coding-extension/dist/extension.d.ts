import * as vscode from 'vscode';
export declare class NearbyCodingViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionContext;
    static readonly viewType = "nearbyCoding.plaza";
    private _view?;
    private _context;
    private _userId;
    private _postInterval?;
    private _getInterval?;
    private _disposed;
    private _lastSeenUsers;
    constructor(_extensionContext: vscode.ExtensionContext);
    private _generateUserId;
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): void;
    private _getHtmlForWebview;
    private _getConfiguration;
    private _sendPing;
    private _fetchUsers;
    private _startLoops;
    private _stopLoops;
    private _updateWebviewWithCurrentConfig;
    private _restartLoops;
    dispose(): void;
}
export declare function activate(context: vscode.ExtensionContext): void;
export declare function deactivate(): void;
