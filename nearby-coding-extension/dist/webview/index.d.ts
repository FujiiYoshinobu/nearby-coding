import "./styles/index.css";
declare global {
    interface Window {
        acquireVsCodeApi: () => any;
    }
}
