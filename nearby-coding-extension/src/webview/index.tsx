import { createRoot } from "react-dom/client";
import App from "./components/App";
import { mockVsCodeApi, simulateVsCodeMessages } from "./mock";
import "./styles/index.css";

// VS Code webview用のAPIを定義
declare global {
  interface Window {
    acquireVsCodeApi: () => any;
  }
}

// 開発環境の場合はmock APIを設定
if (!window.acquireVsCodeApi) {
  (window as any).acquireVsCodeApi = () => mockVsCodeApi;

  // 開発環境でメッセージシミュレーションを開始
  setTimeout(() => {
    simulateVsCodeMessages((event) => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: event.data,
        })
      );
    });
  }, 100);
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
