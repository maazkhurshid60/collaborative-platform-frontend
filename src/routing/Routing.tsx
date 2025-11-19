
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { lazy } from "react";
import WrappedRoute from "../components/wrappedRoute/WrappedRoute";
import RejectedUsers from "../pages/superadminPages/allUsers/RejectedUsers";
const LicenseNo = lazy(() => import("../pages/auth/LicenseScreen/LicenseScreen"))
const ViewUser = lazy(() => import("../pages/superadminPages/allUsers/ViewUser"))
const ClientSignup = lazy(() => import("../pages/auth/signup/ClientSignup"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword/ForgotPassword"));
const ResettPassword = lazy(() => import("../pages/auth/resetPassword/ResetPassword"));
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
const ChangePassword = lazy(() => import("../pages/userSetting/ChangePassword"))
const Settings = lazy(() => import("../pages/clientPages/settings/Settings"));
const Document = lazy(() => import("../pages/clientPages/documents/Document"));
const PendingUsers = lazy(() => import("../pages/superadminPages/allUsers/PendingUsers"));
const VerifiedUsers = lazy(() => import("../pages/superadminPages/allUsers/VerifiedUsers"));
const AllDocuments = lazy(() => import("../pages/superadminPages/AllDocuments"));

const Routing = () => {
    const loginUserRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role)
    return (
        <Routes>

            {/* Public Routes */}
            <Route path="/" element={<WrappedRoute><Login /></WrappedRoute>} />
            < Route path="/provider-signup" element={<WrappedRoute><ProviderSignup /></WrappedRoute>} />
            < Route path="/client-signup" element={<WrappedRoute><ClientSignup /></WrappedRoute>} />
            < Route path="/invite-chat/:type/:id/:email" element={<WrappedRoute><NonUserChat /></WrappedRoute>} />
            < Route path="/invite-chat/:type/:id" element={<WrappedRoute><NonUserChat /></WrappedRoute>} />
            < Route path="/signup-with-license" element={<WrappedRoute><LicenseNo /></WrappedRoute>} />
            < Route path="/forgot-password" element={<WrappedRoute><ForgotPassword /></WrappedRoute>} />
            < Route path="/reset-password/:token" element={<WrappedRoute><ResettPassword /></WrappedRoute>} />

            {/* Protected Routes */}
            <Route
                element={
                    <WrappedRoute>
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    </WrappedRoute>
                }
            >
                {/* <Route path={`${loginUserRole === "client" ? "/documents" : loginUserRole === "superadmin" ? "/pending-users" : "/dashboard"}`} element={loginUserRole === "client" ? <Suspense fallback={<Loader text="Loading..." />}><Document /></Suspense> : loginUserRole === "superadmin" ? <Suspense fallback={<Loader text="Loading..." />}><PendingUsers /></Suspense> : <Suspense fallback={<Loader text="Loading..." />}><Dashboard /></Suspense>} /> */}
                {
                    loginUserRole === "client" && (
                        <Route
                            path="/documents"
                            element={
                                <WrappedRoute >
                                    <Document />
                                </WrappedRoute>
                            }
                        />
                    )
                }

                {
                    loginUserRole === "superadmin" && (
                        <Route
                            path="/pending-users"
                            element={
                                <WrappedRoute >
                                    <PendingUsers />
                                </WrappedRoute>
                            }
                        />
                    )
                }

                {
                    loginUserRole !== "client" && loginUserRole !== "superadmin" && (
                        <Route
                            path="/dashboard"
                            element={
                                <WrappedRoute>
                                    <Dashboard />
                                </WrappedRoute>
                            }
                        />
                    )
                }

                <Route path="/settings" element={<WrappedRoute ><Settings /></WrappedRoute>} />
                <Route path="/pending-users/view-user/:id" element={<WrappedRoute ><ViewUser /></WrappedRoute>} />
                <Route path="/verified-users/view-user/:id" element={<WrappedRoute ><ViewUser /></WrappedRoute>} />
                <Route path="/rejected-users/view-user/:id" element={<WrappedRoute ><ViewUser /></WrappedRoute>} />
                <Route path="/all-documents" element={<WrappedRoute ><AllDocuments /></WrappedRoute>} />
                <Route path="/verified-users" element={<WrappedRoute ><VerifiedUsers /></WrappedRoute>} />
                <Route path="/rejected-users" element={<WrappedRoute ><RejectedUsers /></WrappedRoute>} />
                <Route path="/notification" element={<WrappedRoute ><Notification /></WrappedRoute>} />
                <Route path="/setting" element={<WrappedRoute ><UserSetting /></WrappedRoute>} />
                <Route path="/setting/change-password" element={<WrappedRoute ><ChangePassword /></WrappedRoute>} />
                <Route path="/chat" element={<WrappedRoute><Chat /></WrappedRoute>} />
                <Route path="/clients" element={<WrappedRoute ><Clients /></WrappedRoute>} />
                <Route path="/clients/add-client" element={<WrappedRoute ><AddClient /></WrappedRoute>} />
                <Route path="/clients/edit-client/:id" element={<WrappedRoute ><EditClient /></WrappedRoute>} />
                <Route path="/user-profile" element={<WrappedRoute ><UserProfile /></WrappedRoute>} />
                <Route path="/providers" element={<WrappedRoute ><Providers /></WrappedRoute>} />
                <Route path="/providers/:id" element={<WrappedRoute ><ProviderProfile /></WrappedRoute>} />
                <Route path="/help-and-support" element={<WrappedRoute ><HelpAndSupport /></WrappedRoute>} />
            </Route>
        </Routes >
    );
};

export default Routing;
