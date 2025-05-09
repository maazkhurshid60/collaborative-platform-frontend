
import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/login/Login";
import ProviderSignup from "../pages/auth/signup/ProviderSignup";
import ClientSignup from "../pages/auth/signup/ClientSignup";
import Dashboard from "../pages/providerPages/dashboard/Dashboard";
import Clients from "../pages/providerPages/clients/Clients";
import Chat from "../pages/providerPages/chat/Chat";
import UserProfile from "../pages/providerPages/userProfile/UserProfile";
import Providers from "../pages/providerPages/providers/Providers";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/dashboardLayout/DashboardLayout";
import Notification from "../pages/notification/Notification";
import UserSetting from "../pages/userSetting/UserSetting";
import HelpAndSupport from "../pages/providerPages/helpAndSupport/HelpAndSupport";
import NonUserChat from "../pages/providerPages/nonUserChat/NonUserChat";
import ProviderProfile from "../pages/providerPages/providers/providerProfile/ProviderProfile";
import AddClient from "../components/pagesComponent/client/addClient/AddClient";
import EditClient from "../components/pagesComponent/client/editClient/EditClient";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Document from "../pages/clientPages/documents/Document";
import Settings from "../pages/clientPages/settings/Settings";
import CnicScreen from "../pages/auth/cnicScreen/CnicScreen";
import ChangePassword from "../pages/userSetting/ChangePassword";

const Routing = () => {
    const loginUserRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role)

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/provider-signup" element={<ProviderSignup />} />
            <Route path="/client-signup" element={<ClientSignup />} />
            <Route path="/invite-chat/:type/:id" element={<NonUserChat />} />
            <Route path="/signup-with-cnic" element={<CnicScreen />} />

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path={`${loginUserRole === "client" ? "/documents" : "/dashboard"}`} element={loginUserRole === "client" ? <Document /> : <Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="/setting" element={<UserSetting />} />
                <Route path="/setting/change-password" element={<ChangePassword />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/add-client" element={<AddClient />} />
                <Route path="/clients/edit-client/:id" element={<EditClient />} />
                <Route path="/user-profile" element={<UserProfile />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/providers/:id" element={<ProviderProfile />} />
                <Route path="/help-and-support" element={<HelpAndSupport />} />
            </Route>
        </Routes>
    );
};

export default Routing;
