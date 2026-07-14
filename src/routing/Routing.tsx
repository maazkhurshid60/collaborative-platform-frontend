import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import { RootState } from "../redux/store";
import WrappedRoute from "../components/wrappedRoute/WrappedRoute";
import PublicRoute from "./PublicRoute";
import SuperAdminMePage from "../pages/superadminPages/SuperAdminMePage/SuperAdminMePage";
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
const LicenseNo = lazy(
  () => import("../pages/auth/LicenseScreen/LicenseScreen"),
);
const ViewUser = lazy(
  () => import("../pages/superadminPages/allUsers/ViewUser"),
);
const ClientSignup = lazy(() => import("../pages/auth/signup/ClientSignup"));
const VerifyEmailPage = lazy(
  () => import("../pages/auth/verifyEmail/VerifyEmailPage"),
);
const ForgotPassword = lazy(
  () => import("../pages/auth/forgotPassword/ForgotPassword"),
);
const ResettPassword = lazy(
  () => import("../pages/auth/resetPassword/ResetPassword"),
);
const Dashboard = lazy(
  () => import("../pages/providerPages/dashboard/Dashboard"),
);
const Clients = lazy(() => import("../pages/providerPages/clients/Clients"));
const Chat = lazy(() => import("../pages/providerPages/chat/Chat"));
const UserProfile = lazy(
  () => import("../pages/providerPages/userProfile/UserProfile"),
);
const Providers = lazy(
  () => import("../pages/providerPages/providers/Providers"),
);
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const DashboardLayout = lazy(
  () => import("../layouts/dashboardLayout/DashboardLayout"),
);
const NotificationPage = lazy(
  () => import("../pages/notification/Notification"),
);
const UserSetting = lazy(() => import("../pages/userSetting/UserSetting"));
const TwoFactorSettings = lazy(
  () => import("../pages/userSetting/TwoFactorSettings"),
);
const HelpAndSupport = lazy(
  () => import("../pages/providerPages/helpAndSupport/HelpAndSupport"),
);
const NonUserChat = lazy(
  () => import("../pages/providerPages/nonUserChat/NonUserChat"),
);
const ProviderProfile = lazy(
  () =>
    import("../pages/providerPages/providers/providerProfile/ProviderProfile"),
);
const AddClient = lazy(
  () => import("../components/pagesComponent/client/addClient/AddClient"),
);
const EditClient = lazy(
  () => import("../components/pagesComponent/client/editClient/EditClient"),
);
const Login = lazy(() => import("../pages/auth/login/Login"));
const ProviderSignup = lazy(
  () => import("../pages/auth/signup/ProviderSignup"),
);
const ChangePassword = lazy(
  () => import("../pages/userSetting/ChangePassword"),
);
const Settings = lazy(() => import("../pages/clientPages/settings/Settings"));
const Document = lazy(() => import("../pages/clientPages/documents/Document"));
const AllUsers = lazy(
  () => import("../pages/superadminPages/allUsers/AllUsers"),
);
const AllDocuments = lazy(
  () => import("../pages/superadminPages/AllDocuments"),
);
const ClientProfile = lazy(
  () => import("../pages/providerPages/clients/clientProfile/ClientProfile"),
);
const AdminInvoices = lazy(
  () => import("../pages/adminPages/invoices/AdminInvoices"),
);
const NotFound = lazy(() => import("../pages/errorPages/NotFound"));
const InviteProvider = lazy(
  () => import("../pages/providerPages/inviteProvider/InviteProvider"),
);
const DocumentSharing = lazy(
  () => import("../pages/providerPages/documentSharing/DocumentSharing"),
);
const AuditLogs = lazy(
  () => import("../pages/superadminPages/auditLogs/AuditLogs"),
);
const PublicFormView = lazy(
  () => import("../pages/publicPages/PublicFormView"),
);
const FormBuilder = lazy(
  () => import("../pages/providerPages/formBuilder/FormBuilder"),
);
const ChatWithAI = lazy(
  () => import("../pages/providerPages/chatWithAI/ChatWithAI"),
);
const SuperAdminDashboard = lazy(
  () => import("../pages/superadminPages/dashboard/SuperAdminDashboard"),
);

const Routing = () => {
  const loginUserRole = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails?.user?.role,
  );
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <WrappedRoute>
            <PublicRoute>
              <Login />
            </PublicRoute>
          </WrappedRoute>
        }
      />
      <Route
        path="/provider-signup"
        element={
          <WrappedRoute>
            <PublicRoute>
              <ProviderSignup />
            </PublicRoute>
          </WrappedRoute>
        }
      />

      {/* Implementation of payment module */}
      {/* <Route path="/free-trail-form" element={<WrappedRoute><FreeTrailForm /></WrappedRoute>} />
            <Route path="/pricing-plan" element={<WrappedRoute><PricingPlan /></WrappedRoute>} />
            <Route path="/payment-success" element={<WrappedRoute><PaymentSuccess /></WrappedRoute>} />
            <Route path="/payment-failure" element={<WrappedRoute><PaymentFailure /></WrappedRoute>} />
            <Route path="/payment-cancel" element={<WrappedRoute><PaymentCancel /></WrappedRoute>} /> */}

      {/* Admin Biling routes */}
      {/* <Route path="transection-details" element={<WrappedRoute><TransectionDetails /></WrappedRoute>} />
            <Route path="provider-update-transection" /> */}

      <Route
        path="/client-signup"
        element={
          <WrappedRoute>
            <PublicRoute>
              <ClientSignup />
            </PublicRoute>
          </WrappedRoute>
        }
      />
      <Route
        path="/invite-chat/:type/:id/:email"
        element={
          <WrappedRoute>
            <NonUserChat />
          </WrappedRoute>
        }
      />
      <Route
        path="/invite-chat/:type/:id"
        element={
          <>
            <NonUserChat />
          </>
        }
      />
      <Route
        path="/signup-with-client-id"
        element={
          <WrappedRoute>
            <PublicRoute>
              <LicenseNo />
            </PublicRoute>
          </WrappedRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <WrappedRoute>
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          </WrappedRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <WrappedRoute>
            <ResettPassword />
          </WrappedRoute>
        }
      />
      <Route
        path="/verify-email/:token"
        element={
          <WrappedRoute>
            <VerifyEmailPage />
          </WrappedRoute>
        }
      />
      <Route
        path="/public/forms/:token"
        element={
          <WrappedRoute>
            <PublicFormView />
          </WrappedRoute>
        }
      />

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
        {loginUserRole === "client" && (
          <Route
            path="/documents"
            element={
              <WrappedRoute>
                <Document />
              </WrappedRoute>
            }
          />
        )}

        {loginUserRole === "superAdmin" && (
          <Route
            path="/all-users"
            element={
              <WrappedRoute>
                <AllUsers />
              </WrappedRoute>
            }
          />
        )}

        {loginUserRole === "superAdmin" && (
          <Route
            path="/admin-dashboard"
            element={
              <WrappedRoute>
                <SuperAdminDashboard />
              </WrappedRoute>
            }
          />
        )}

        {loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
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
        )}

        {loginUserRole === "superAdmin" && (
          <Route
            path="/transaction-details"
            element={
              <WrappedRoute>
                <TransactionDetail />
              </WrappedRoute>
            }
          />
        )}

        {loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
          <Route
            path="/subscription"
            element={
              <WrappedRoute>
                <SubscriptionSettingPage />
              </WrappedRoute>
            }
          />
        )}

        {loginUserRole === "superAdmin" && (
          <Route
            path="/billing-management"
            element={
              <WrappedRoute>
                <SubscriptionPage />
              </WrappedRoute>
            }
          />
        )}
        {loginUserRole === "superAdmin" && (
          <Route
            path="/billing-management/:id"
            element={
              <WrappedRoute>
                <ProviderDetail />
              </WrappedRoute>
            }
          />
        )}
        {loginUserRole === "superAdmin" && (
          <Route
            path="/provider/refund/:id"
            element={
              <WrappedRoute>
                <RefundTransaction />
              </WrappedRoute>
            }
          />
        )}
        {loginUserRole === "superAdmin" && (
          <Route
            path="/invoices"
            element={
              <WrappedRoute>
                <AdminInvoices />
              </WrappedRoute>
            }
          />
        )}
        {loginUserRole === "superAdmin" && (
          <Route
            path="/audit-logs"
            element={
              <WrappedRoute>
                <AuditLogs />
              </WrappedRoute>
            }
          />
        )}

        {loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
          <Route
            path="/invoices"
            element={
              <WrappedRoute>
                <BilingPage />
              </WrappedRoute>
            }
          />
        )}

        <Route
          path="/settings"
          element={
            <WrappedRoute>
              <Settings />
            </WrappedRoute>
          }
        />
        <Route
          path="/all-users/view-user/:id"
          element={
            <WrappedRoute>
              <ViewUser />
            </WrappedRoute>
          }
        />
        <Route
          path="/all-documents"
          element={
            <WrappedRoute>
              <AllDocuments />
            </WrappedRoute>
          }
        />
        {loginUserRole === "superAdmin" && (
          <Route
            path="/create-template"
            element={
              <WrappedRoute>
                <FormBuilder />
              </WrappedRoute>
            }
          />
        )}
        {loginUserRole === "superAdmin" && (
          <Route
            path="/edit-template/:id"
            element={
              <WrappedRoute>
                <FormBuilder />
              </WrappedRoute>
            }
          />
        )}

        <Route
          path="/notification"
          element={
            <WrappedRoute>
              <NotificationPage />
            </WrappedRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <WrappedRoute>
              <UserSetting />
            </WrappedRoute>
          }
        />
        <Route
          path="/setting/two-factor"
          element={
            <WrappedRoute>
              <TwoFactorSettings />
            </WrappedRoute>
          }
        />
        {/* <Route
          path="/setting/two-factor"
          element={
            <WrappedRoute>
              <TwoFactorSettings />
            </WrappedRoute>
          }
        /> */}
        <Route
          path="/setting/change-password"
          element={
            <WrappedRoute>
              <ChangePassword />
            </WrappedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <WrappedRoute>
              <Chat />
            </WrappedRoute>
          }
        />
        {loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
          <Route
            path="/chat-with-ai"
            element={
              <WrappedRoute>
                <SubscriptionGuard
                  blockTrial={true}
                  fallback={
                    <UpgradePrompt
                      message="Upgrade to chat with AI"
                      showFullScreen={true}
                    />
                  }
                >
                  <ChatWithAI />
                </SubscriptionGuard>
              </WrappedRoute>
            }
          />
        )}
        <Route
          path="/clients"
          element={
            <WrappedRoute>
              <Clients />
            </WrappedRoute>
          }
        />
        <Route
          path="/document-sharing"
          element={
            <WrappedRoute>
              <SubscriptionGuard
                fallback={
                  <UpgradePrompt
                    message="Upgrade to share documents with clients"
                    showFullScreen={true}
                  />
                }
              >
                <DocumentSharing />
              </SubscriptionGuard>
            </WrappedRoute>
          }
        />

        {loginUserRole !== "client" && loginUserRole !== "superAdmin" && (
          <Route
            path="/subscription/change-plan"
            element={
              <WrappedRoute>
                <ChangePlanScreen />
              </WrappedRoute>
            }
          />
        )}

        <Route
          path="/clients/add-client"
          element={
            <WrappedRoute>
              <SubscriptionGuard
                fallback={
                  <UpgradePrompt
                    message="Upgrade to add new clients"
                    showFullScreen={true}
                  />
                }
              >
                <AddClient />
              </SubscriptionGuard>
            </WrappedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <WrappedRoute>
              <ClientProfile />
            </WrappedRoute>
          }
        />
        <Route
          path="/clients/edit-client/:id"
          element={
            <WrappedRoute>
              <SubscriptionGuard
                fallback={
                  <UpgradePrompt
                    message="Upgrade to edit clients"
                    showFullScreen={true}
                  />
                }
              >
                <EditClient />
              </SubscriptionGuard>
            </WrappedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <WrappedRoute>
              <UserProfile />
            </WrappedRoute>
          }
        />
        <Route
          path="/providers"
          element={
            <WrappedRoute>
              <Providers />
            </WrappedRoute>
          }
        />
        <Route
          path="/providers/:id"
          element={
            <WrappedRoute>
              <ProviderProfile />
            </WrappedRoute>
          }
        />
        <Route
          path="/invite-provider"
          element={
            <WrappedRoute>
              <InviteProvider />
            </WrappedRoute>
          }
        />
        <Route
          path="/help-and-support"
          element={
            <WrappedRoute>
              <HelpAndSupport />
            </WrappedRoute>
          }
        />
        <Route path="/chat/individual/:id" element={<Chat />} />
        <Route path="/chat/group/:id" element={<Chat />} />
        <Route
          path="/super-admin"
          element={
            <WrappedRoute>
              <SuperAdminMePage />
            </WrappedRoute>
          }
        />

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

        <Route
          path="/select-plan"
          element={
            <WrappedRoute>
              <SelectPlan />
            </WrappedRoute>
          }
        />
        <Route
          path="/confirm-free-account"
          element={
            <WrappedRoute>
              <ConfirmFreeAccount />
            </WrappedRoute>
          }
        />
        <Route
          path="/payment-checkout"
          element={
            <WrappedRoute>
              <PaymentCheckoutPage />
            </WrappedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <WrappedRoute>
              <PaymentSuccessPage />
            </WrappedRoute>
          }
        />
        <Route
          path="/payment-failure"
          element={
            <WrappedRoute>
              <PaymentFailurePage />
            </WrappedRoute>
          }
        />
      </Route>
      <Route path="/super-admin" element={<SuperAdminMePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Routing;
