import React from "react";
export interface User {
    id: string;
    name: string;
    message: string;
    avatar: string;
    lastSeen: number;
}
declare const App: React.FC;
export default App;
