import MessageIcon from "../components/icons/dashboardIcons/providersPortalIcons/message/Message";
import DashboardIcon from "../components/icons/dashboardIcons/providersPortalIcons/dashboard/Dashboard";
import ClientsIcon from "../components/icons/dashboardIcons/providersPortalIcons/clients/Clients";
import ProvidersIcon from "../components/icons/dashboardIcons/providersPortalIcons/providers/Providers";
import { RiUserLine } from "react-icons/ri";
import DocumentIcon from "../components/icons/dashboardIcons/clientsPortalIcons/document/Document";
import SettingIcon from "../components/icons/dashboardIcons/clientsPortalIcons/setting/Setting";

console.log("typeof MessageIcontypeof MessageIcontypeof MessageIcon", typeof MessageIcon);
export const ProviderSidebarData = [
    {
        name: "Dashboard",
        url: "/dashboard",
        icon: DashboardIcon
    },
    {
        name: "Chat",
        url: "/chat",
        icon: MessageIcon
    },
    {
        name: "Clients",
        url: "/clients",
        icon: ClientsIcon
    },
    {
        name: "User Profile",
        url: "/user-profile",
        icon: RiUserLine
    },
    {
        name: "Providers",
        url: "/providers",
        icon: ProvidersIcon
    }
];


export const ClientSidebarData = [
    {
        name: "Documents",
        url: "/documents",
        icon: DocumentIcon
    },
    {
        name: "Account Settings",
        url: "/settings",
        icon: SettingIcon
    }
]