import MessageIcon from "../components/icons/dashboardIcons/providersPortalIcons/message/Message";
import DashboardIcon from "../components/icons/dashboardIcons/providersPortalIcons/dashboard/Dashboard";
import ClientsIcon from "../components/icons/dashboardIcons/providersPortalIcons/clients/Clients";
import ProvidersIcon from "../components/icons/dashboardIcons/providersPortalIcons/providers/Providers";
import { RiUserLine } from "react-icons/ri";
import DocumentIcon from "../components/icons/dashboardIcons/clientsPortalIcons/document/Document";
import SettingIcon from "../components/icons/dashboardIcons/clientsPortalIcons/setting/Setting";

export const ProviderSidebarData = [
    {
        name: "Dashboard",
        url: "/dashboard",
        icon: DashboardIcon
    },
    {
        name: "Chats",
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
export const SuperAdminSidebarData = [
    {
        name: "Pending Users",
        url: "/pending-users",
        icon: ClientsIcon
    },
    {
        name: "Verified Users",
        url: "/verified-users",
        icon: ClientsIcon
    },
    {
        name: "Rejected Users",
        url: "/rejected-users",
        icon: ClientsIcon
    }
    , {
        name: "Documents",
        url: "/all-documents",
        icon: DocumentIcon
    },
]