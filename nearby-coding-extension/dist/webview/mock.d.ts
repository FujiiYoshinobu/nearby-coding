export declare const mockUsers: {
    id: string;
    name: string;
    message: string;
    avatar: string;
    lastSeen: number;
}[];
export declare const mockVsCodeApi: {
    postMessage: (message: any) => void;
    setState: (state: any) => void;
    getState: () => {};
};
export declare const simulateVsCodeMessages: (callback: (event: MessageEvent) => void) => void;
