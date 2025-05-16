import { LuLayoutDashboard } from "react-icons/lu";
import { TbMessageCircle } from "react-icons/tb";
import { AiOutlineUser } from "react-icons/ai";
import { PiUsers } from "react-icons/pi";
import { TbUsersPlus } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { CgLoadbarDoc } from "react-icons/cg";

export const ProviderSidebarData = [
    {
        name: "Dashboard",
        url: "/dashboard",
        icon: LuLayoutDashboard
    },
    {
        name: "Chat",
        url: "/chat",
        icon: TbMessageCircle
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