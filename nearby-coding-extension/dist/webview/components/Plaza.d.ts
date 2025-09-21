import React from "react";
import { LevelUpEvent, User, XPEvent } from "../../types";
interface PlazaProps {
    users: User[];
    newUsers: User[];
    user: User;
    xpEvents: XPEvent[];
    levelUpEvent: LevelUpEvent | null;
    onBackToSetup: () => void;
}
declare const Plaza: React.FC<PlazaProps>;
export default Plaza;
