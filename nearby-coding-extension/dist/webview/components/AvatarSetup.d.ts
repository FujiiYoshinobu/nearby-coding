import React from "react";
import { AvatarType, User } from "../../types";
interface AvatarSetupProps {
    user: User;
    onComplete: (userData: {
        name: string;
        message: string;
        avatarType: AvatarType;
    }) => void;
}
declare const AvatarSetup: React.FC<AvatarSetupProps>;
export default AvatarSetup;
