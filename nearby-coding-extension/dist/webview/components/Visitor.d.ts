import React from "react";
import { User } from "./App";
interface VisitorProps {
    user: User;
    onExit: () => void;
}
declare const Visitor: React.FC<VisitorProps>;
export default Visitor;
