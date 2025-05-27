import { LuLayoutDashboard } from "react-icons/lu";
// import { TbMessageCircle } from "react-icons/tb";
import { AiOutlineUser } from "react-icons/ai";
import { PiUsers } from "react-icons/pi";
import { TbUsersPlus } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { CgLoadbarDoc } from "react-icons/cg";
import MessageIcon from "../assets/icons/MessageIcon.svg?react"; // ✅ forces component
console.log("typeof MessageIcontypeof MessageIcontypeof MessageIcon", typeof MessageIcon);
export const ProviderSidebarData = [
    {
        name: "Dashboard",
        url: "/dashboard",
        icon: LuLayoutDashboard
    },
    {
        name: "Chat",
        url: "/chat",
        icon: MessageIcon
    },
    {
        name: "Clients",
        url: "/clients",
        icon: PiUsers
    },
    {
        name: "User Profile",
        url: "/user-profile",
        icon: AiOutlineUser
    },
    {
        name: "Providers",
        url: "/providers",
        icon: TbUsersPlus
    }
];


export const ClientSidebarData = [
    {
        name: "Documents",
        url: "/documents",
        icon: CgLoadbarDoc
    },
    {
        name: "Account Settings",
        url: "/settings",
        icon: IoSettingsOutline
    }
]