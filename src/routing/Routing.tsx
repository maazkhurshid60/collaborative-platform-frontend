
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { lazy } from "react";
import WrappedRoute from "../components/wrappedRoute/WrappedRoute";
import PublicRoute from "./PublicRoute";
import SuperAdminMePage from "../pages/superadminPages/SuperAdminMePage/SuperAdminMePage";
import RejectedUsers from "../pages/superadminPages/allUsers/RejectedUsers";
import TransactionDetail from "../pages/superadminPages/transaction-detail/TransactionDetail";
import ProviderDetail from "../pages/superadminPages/providerDetail/ProviderBillingDetail";
import SubscriptionPage from "../pages/superadminPages/subscription/BillingMangement";
import BilingPage from "../pages/providerPages/biling/BilingPage";
import ChangePlanScreen from "../pages/providerPages/change-plan-screen/ChangePlanScreen";
import { SubscriptionSettingPage } from "../pages/providerPages/subscription-setting/SubscriptionPage";
import RefundTransaction from "../pages/superadminPages/transaction-detail/RefundDetailByUserId";
import PaymentSuccessPage from "../pages/payment-pages/PaymentSuccessPage";
import { PaymentFailurePage } from "../pages/payment-pages/PaymentFailurePage";
import { PaymentCheckoutPage } from "../pages/payment-pages/Payment-CheckoutPage";
import ConfirmFreeAccount from "../pages/auth/confirmFreeAccount/ConfirmFreeAccount";
import SelectPlan from "../pages/payment-pages/SelectPlan";
import PlanExpiredOverlay from "../components/pagesComponent/dashboard/plan-expired/PlanExpiredOverlay";
import { SubscriptionGuard } from "../components/subscriptionGuard/SubscriptionGuard";
import UpgradePrompt from "../components/upgradePrompt/UpgradePrompt";
const LicenseNo = lazy(() => import("../pages/auth/LicenseScreen/LicenseScreen"))
const ViewUser = lazy(() => import("../pages/superadminPages/allUsers/ViewUser"))
const ClientSignup = lazy(() => import("../pages/auth/signup/ClientSignup"));
const VerifyEmailPage = lazy(() => import("../pages/auth/verifyEmail/VerifyEmailPage"));
const ForgotPassword = lazy(() => import("../pages/auth/forgotPassword/ForgotPassword"));
const ResettPassword = lazy(() => import("../pages/auth/resetPassword/ResetPassword"));
const Dashboard = lazy(() => import("../pages/providerPages/dashboard/Dashboard"));
const Clients = lazy(() => import("../pages/providerPages/clients/Clients"));
const Chat = lazy(() => import("../pages/providerPages/chat/Chat"));
const UserProfile = lazy(() => import("../pages/providerPages/userProfile/UserProfile"));
const Providers = lazy(() => import("../pages/providerPages/providers/Providers"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const DashboardLayout = lazy(() => import("../layouts/dashboardLayout/DashboardLayout"));
const NotificationPage = lazy(() => import("../pages/notification/Notification"));
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
const ClientProfile = lazy(() => import("../pages/providerPages/clients/clientProfile/ClientProfile"));
const AdminInvoices = lazy(() => import("../pages/adminPages/invoices/AdminInvoices"));
const NotFound = lazy(() => import("../pages/errorPages/NotFound"));
const InviteProvider = lazy(() => import("../pages/providerPages/inviteProvider/InviteProvider"));

const Routing = () => {
    const loginUserRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role)
    return (
        <Routes>

            {/* Public Routes */}
            <Route path="/" element={<WrappedRoute><PublicRoute><Login /></PublicRoute></WrappedRoute>} />
            <Route path="/provider-signup" element={<WrappedRoute><PublicRoute><ProviderSignup /></PublicRoute></WrappedRoute>} />




            {/* Implementation of payment module */}
            {/* <Route path="/free-trail-form" element={<WrappedRoute><FreeTrailForm /></WrappedRoute>} />
            <Route path="/pricing-plan" element={<WrappedRoute><PricingPlan /></WrappedRoute>} />
            <Route path="/payment-success" element={<WrappedRoute><PaymentSuccess /></WrappedRoute>} />
            <Route path="/payment-failure" element={<WrappedRoute><PaymentFailure /></WrappedRoute>} />
            <Route path="/payment-cancel" element={<WrappedRoute><PaymentCancel /></WrappedRoute>} /> */}


            {/* Admin Biling routes */}
            {/* <Route path="transection-details" element={<WrappedRoute><TransectionDetails /></WrappedRoute>} />
            <Route path="provider-update-transection" /> */}



            <Route path="/client-signup" element={<WrappedRoute><PublicRoute><ClientSignup /></PublicRoute></WrappedRoute>} />
            <Route path="/invite-chat/:type/:id/:email" element={<WrappedRoute><NonUserChat /></WrappedRoute>} />
            <Route path="/invite-chat/:type/:id" element={<><NonUserChat /></>} />
            <Route path="/signup-with-client-id" element={<WrappedRoute><PublicRoute><LicenseNo /></PublicRoute></WrappedRoute>} />
            <Route path="/forgot-password" element={<WrappedRoute><PublicRoute><ForgotPassword /></PublicRoute></WrappedRoute>} />
            <Route path="/reset-password/:token" element={<WrappedRoute><ResettPassword /></WrappedRoute>} />
            <Route path="/verify-email/:token" element={<WrappedRoute><VerifyEmailPage /></WrappedRoute>} />

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
                    loginUserRole === "superAdmin" && (
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
                    loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
                        <Route
                            path="/dashboard"
                            element={
                                <WrappedRoute>
                                    <SubscriptionGuard>
                                        <Dashboard />
                                    </SubscriptionGuard>
                                </WrappedRoute>
                            }
                        />
                    )
                }

                {
                    loginUserRole === "superAdmin" && (
                        <Route
                            path="/transaction-details"
                            element={
                                <WrappedRoute>
                                    <TransactionDetail />
                                </WrappedRoute>
                            }
                        />
                    )
                }

                {
                    loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
                        <Route path="/subscription" element={<WrappedRoute><SubscriptionSettingPage /></WrappedRoute>} />
                    )
                }

                {
                    loginUserRole === "superAdmin" && (
                        <Route path="/billing-management" element={<WrappedRoute><SubscriptionPage /></WrappedRoute>} />
                    )
                }
                {
                    loginUserRole === "superAdmin" && (
                        <Route
                            path="/billing-management/:id"
                            element={
                                <WrappedRoute>
                                    <ProviderDetail />
                                </WrappedRoute>
                            }
                        />
                    )
                }
                {
                    loginUserRole === "superAdmin" && (
                        <Route path="/provider/refund/:id" element={<WrappedRoute><RefundTransaction /></WrappedRoute>} />
                    )
                }
                {
                    loginUserRole === "superAdmin" && (
                        <Route path="/invoices" element={<WrappedRoute><AdminInvoices /></WrappedRoute>} />
                    )
                }

                {
                    loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
                        <Route path="/invoices" element={<WrappedRoute ><BilingPage /></WrappedRoute>} />
                    )
                }



                <Route path="/settings" element={<WrappedRoute ><Settings /></WrappedRoute>} />
                <Route path="/pending-users/view-user/:id" element={<WrappedRoute ><ViewUser /></WrappedRoute>} />
                <Route path="/verified-users/view-user/:id" element={<WrappedRoute ><ViewUser /></WrappedRoute>} />
                <Route path="/rejected-users/view-user/:id" element={<WrappedRoute ><ViewUser /></WrappedRoute>} />
                <Route path="/all-documents" element={<WrappedRoute ><AllDocuments /></WrappedRoute>} />
                <Route path="/verified-users" element={<WrappedRoute ><VerifiedUsers /></WrappedRoute>} />
                <Route path="/rejected-users" element={<WrappedRoute ><RejectedUsers /></WrappedRoute>} />
                <Route path="/notification" element={<WrappedRoute ><NotificationPage /></WrappedRoute>} />
                <Route path="/setting" element={<WrappedRoute ><UserSetting /></WrappedRoute>} />
                <Route path="/setting/change-password" element={<WrappedRoute ><ChangePassword /></WrappedRoute>} />
                <Route path="/chat" element={<WrappedRoute><Chat /></WrappedRoute>} />
                <Route path="/clients" element={<WrappedRoute ><Clients /></WrappedRoute>} />


                {
                    loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
                        <Route path="/subscription/change-plan" element={<WrappedRoute ><ChangePlanScreen /></WrappedRoute>} />)

                }





                <Route path="/clients/add-client" element={
                    <WrappedRoute>
                        <SubscriptionGuard fallback={<UpgradePrompt message="Upgrade to add new clients" showFullScreen={true} />}>
                            <AddClient />
                        </SubscriptionGuard>
                    </WrappedRoute>
                } />
                <Route path="/clients/:id" element={<WrappedRoute ><ClientProfile /></WrappedRoute>} />
                <Route path="/clients/edit-client/:id" element={
                    <WrappedRoute>
                        <SubscriptionGuard fallback={<UpgradePrompt message="Upgrade to edit clients" showFullScreen={true} />}>
                            <EditClient />
                        </SubscriptionGuard>
                    </WrappedRoute>
                } />
                <Route path="/user-profile" element={<WrappedRoute ><UserProfile /></WrappedRoute>} />
                <Route path="/providers" element={<WrappedRoute ><Providers /></WrappedRoute>} />
                <Route path="/providers/:id" element={<WrappedRoute ><ProviderProfile /></WrappedRoute>} />
                <Route path="/invite-provider" element={<WrappedRoute ><InviteProvider /></WrappedRoute>} />
                <Route path="/help-and-support" element={<WrappedRoute ><HelpAndSupport /></WrappedRoute>} />
                <Route path="/chat/individual/:id" element={<Chat />} />
                <Route path="/chat/group/:id" element={<Chat />} />
                <Route path="/super-admin" element={<WrappedRoute><SuperAdminMePage /></WrappedRoute>} />

                {/* Test Expired UI within Dashboard */}
                <Route
                    path="/test-expired-ui"
                    element={
                        <WrappedRoute>
                            <div className="min-h-screen pl-2 pr-2 pt-0 pb-0">
                                <PlanExpiredOverlay />
                                {/* <TrialExpiredModal /> */}
                            </div>
                        </WrappedRoute>
                    }
                />


                <Route path="/select-plan" element={<WrappedRoute><SelectPlan /></WrappedRoute>} />
                <Route path="/confirm-free-account" element={<WrappedRoute><ConfirmFreeAccount /></WrappedRoute>} />
                <Route path="/payment-checkout" element={<WrappedRoute><PaymentCheckoutPage /></WrappedRoute>} />
                <Route path="/payment-success" element={<WrappedRoute><PaymentSuccessPage /></WrappedRoute>} />
                <Route path="/payment-failure" element={<WrappedRoute><PaymentFailurePage /></WrappedRoute>} />
            </Route>
            <Route path="/super-admin" element={<SuperAdminMePage />} />
            <Route path="*" element={<NotFound />} />
        </Routes >
    );
};

export default Routing;
