import React from "react";
import { User } from "./App";
interface PlazaProps {
    users: User[];
    newUsers: User[];
    selfId: string;
    selfAvatar: string;
}
declare const Plaza: React.FC<PlazaProps>;
export default Plaza;
