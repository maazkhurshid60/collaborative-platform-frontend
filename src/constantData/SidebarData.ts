import {
  ClipboardList,
  FileText,
  Bot,
  ShieldCheck,
  MessageCircleQuestion,
  CalendarDays,
} from "lucide-react";

import MessageIcon from "../components/icons/dashboardIcons/providersPortalIcons/message/Message";
import DashboardIcon from "../components/icons/dashboardIcons/providersPortalIcons/dashboard/Dashboard";
import ClientsIcon from "../components/icons/dashboardIcons/providersPortalIcons/clients/Clients";

import DocumentIcon from "../components/icons/dashboardIcons/clientsPortalIcons/document/Document";
import SettingIcon from "../components/icons/dashboardIcons/clientsPortalIcons/setting/Setting";
import BillingIcon from "../components/BillingIcon";
import InviteProvider from "../components/icons/dashboardIcons/providersPortalIcons/clients/InviteProvider";
import InvoiceIcon from "../components/icons/Invocies/InvociesIcon";
import ProvidersInDashboardIcon from "../components/icons/dashboardIcons/providersPortalIcons/providers/ProvidersInDashboard";
import SubscriptionIcon from "../components/icons/crownIcon/CrownIcon";
import VerifiedIcon from "../components/icons/dashboardIcons/providersPortalIcons/clients/VerifiedIcon";
import UserIconForSidbar from "../components/icons/dashboardIcons/providersPortalIcons/clients/UserIconForSidbar";

export const ProviderSidebarData = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: DashboardIcon,
  },

  {
    name: "Chats",
    url: "/chat",
    icon: MessageIcon,
  },
  {
    name: "Providers",
    url: "/providers",
    icon: ProvidersInDashboardIcon,
  },
  {
    name: "Clients",
    url: "/clients",
    icon: ClientsIcon,
  },
  {
    name: "Document Sharing",
    url: "/document-sharing",
    icon: DocumentIcon,
  },
  {
    name: "Invite Provider",
    url: "/invite-provider",
    icon: InviteProvider,
  },
  {
    name: "Subscription",
    url: "/subscription",
    icon: SubscriptionIcon,
  },
  {
    name: "Invoices",
    url: "/invoices",
    icon: InvoiceIcon,
  },
  {
    name: "Chat with AI",
    url: "/chat-with-ai",
    icon: Bot,
  },
  {
    name: "Queries",
    url: "/queries",
    icon: MessageCircleQuestion,
  },
  {
    name: "Appointments",
    url: "/appointments",
    icon: CalendarDays,
  },
  {
    name: "User Profile",
    url: "/user-profile",
    icon: UserIconForSidbar,
  },
];

export const ClientSidebarData = [
  {
    name: "Documents",
    url: "/documents",
    icon: DocumentIcon,
  },
  {
    name: "Chats",
    url: "/chat",
    icon: MessageIcon,
  },
  {
    name: "Account Settings",
    url: "/settings",
    icon: SettingIcon,
  },
];

export const SuperAdminSidebarData = [
  {
    name: "Dashboard",
    url: "/admin-dashboard",
    icon: DashboardIcon,
  },
  {
    name: "All Users",
    url: "/all-users",
    icon: VerifiedIcon,
  },
  {
    name: "Documents",
    url: "/all-documents",
    icon: DocumentIcon,
  },
  {
    name: "Transaction Details",
    url: "/transaction-details",
    icon: FileText,
  },
  {
    name: "Billing Management",
    url: "/billing-management",
    icon: BillingIcon,
  },
  {
    name: "Audit Logs",
    url: "/audit-logs",
    icon: ClipboardList,
  },
  {
    name: "BAA",
    url: "/baa-management",
    icon: ShieldCheck,
    subItems: [
      { name: "BAA Document", url: "/baa-management" },
      { name: "Accepted Providers", url: "/baa-accepted-providers" },
    ],
  },

  {
    name: "Contact Queries",
    url: "/contact-queries",
    icon: MessageIcon,
  },
  {
    name: "User Profile",
    url: "/super-admin",
    icon: UserIconForSidbar,
  },
];
