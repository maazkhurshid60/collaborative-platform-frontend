
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { lazy, Suspense } from "react";
import Loader from "../components/loader/Loader";

const ClientSignup = lazy(() => import("../pages/auth/signup/ClientSignup"));
const Dashboard = lazy(() => import("../pages/providerPages/dashboard/Dashboard"));
const Clients = lazy(() => import("../pages/providerPages/clients/Clients"));
const Chat = lazy(() => import("../pages/providerPages/chat/Chat"));
const UserProfile = lazy(() => import("../pages/providerPages/userProfile/UserProfile"));
const Providers = lazy(() => import("../pages/providerPages/providers/Providers"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const DashboardLayout = lazy(() => import("../layouts/dashboardLayout/DashboardLayout"));
const Notification = lazy(() => import("../pages/notification/Notification"));
const UserSetting = lazy(() => import("../pages/userSetting/UserSetting"));
const HelpAndSupport = lazy(() => import("../pages/providerPages/helpAndSupport/HelpAndSupport"));
const NonUserChat = lazy(() => import("../pages/providerPages/nonUserChat/NonUserChat"));
const ProviderProfile = lazy(() => import("../pages/providerPages/providers/providerProfile/ProviderProfile"));
const AddClient = lazy(() => import("../components/pagesComponent/client/addClient/AddClient"));
const EditClient = lazy(() => import("../components/pagesComponent/client/editClient/EditClient"));
const Login = lazy(() => import("../pages/auth/login/Login"))
const ProviderSignup = lazy(() => import("../pages/auth/signup/ProviderSignup"))
const LicenseNo = lazy(() => import("../pages/auth/LicenseScreen/LicenseScreen"))
const ChangePassword = lazy(() => import("../pages/userSetting/ChangePassword"))
const Settings = lazy(() => import("../pages/clientPages/settings/Settings"));
const Document = lazy(() => import("../pages/clientPages/documents/Document"));



const Routing = () => {
    const loginUserRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role)

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Suspense fallback={<Loader text="Loading..." />}><Login /></Suspense>} />
            < Route path="/provider-signup" element={<Suspense fallback={<Loader text="Loading..." />}><ProviderSignup /></Suspense>} />
            < Route path="/client-signup" element={<Suspense fallback={<Loader text="Loading..." />}><ClientSignup /></Suspense>} />
            < Route path="/invite-chat/:type/:id" element={<Suspense fallback={<Loader text="Loading..." />}><NonUserChat /></Suspense>} />
            < Route path="/signup-with-license" element={<Suspense fallback={<Loader text="Loading..." />}><LicenseNo /></Suspense>} />

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path={`${loginUserRole === "client" ? "/documents" : "/dashboard"}`} element={loginUserRole === "client" ? <Suspense fallback={<Loader text="Loading..." />}><Document /></Suspense> : <Suspense fallback={<Loader text="Loading..." />}><Dashboard /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<Loader text="Loading..." />}><Settings /></Suspense>} />
                <Route path="/notification" element={<Suspense fallback={<Loader text="Loading..." />}><Notification /></Suspense>} />
                <Route path="/setting" element={<UserSetting />} />
                <Route path="/setting/change-password" element={<Suspense fallback={<Loader text="Loading..." />}><ChangePassword /></Suspense>} />
                <Route path="/chat" element={<Suspense fallback={<Loader text="Loading..." />}><Chat /></Suspense>} />
                <Route path="/clients" element={<Suspense fallback={<Loader text="Loading..." />}><Clients /></Suspense>} />
                <Route path="/clients/add-client" element={<Suspense fallback={<Loader text="Loading..." />}><AddClient /></Suspense>} />
                <Route path="/clients/edit-client/:id" element={<Suspense fallback={<Loader text="Loading..." />}><EditClient /></Suspense>} />
                <Route path="/user-profile" element={<Suspense fallback={<Loader text="Loading..." />}><UserProfile /></Suspense>} />
                <Route path="/providers" element={<Suspense fallback={<Loader text="Loading..." />}><Providers /></Suspense>} />
                <Route path="/providers/:id" element={<Suspense fallback={<Loader text="Loading..." />}><ProviderProfile /></Suspense>} />
                <Route path="/help-and-support" element={<Suspense fallback={<Loader text="Loading..." />}><HelpAndSupport /></Suspense>} />
            </Route>
        </Routes >
    );
};

export default Routing;
