import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useEffect } from 'react'
import { getSocket, initSocket } from '../../socket/Socket'
import { useSubscription } from '../../hooks/useSubscription'
import PlanExpiredOverlay from '../../components/pagesComponent/dashboard/plan-expired/PlanExpiredOverlay'
import { useSubscriptionModals } from '../../hooks/useSubscriptionModal'
import PaymentOverDueModal from '../../components/modals/PaymentOverdue'
import SubscriptionExpiredModal from '../../components/modals/SubscriptionExpiredModal'
import TrialExpiredModal from '../../components/modals/TrialExpiredModal'
import SubscriptionCanceledModal from '../../components/modals/SubscriptionCanceledModal'
import EmailVerificationBanner from '../../components/common/EmailVerificationBanner'
import GenericLockedPage from '../../components/pagesComponent/dummyPages/GenericLockedPage'
import DummyChatPage from '../../components/pagesComponent/dummyPages/DummyChatPage'


const DashboardLayout = () => {
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail?.userDetails)
    const isRefreshing = useSelector((state: RootState) => state.LoginUserDetail?.isRefreshing)
    const { hasAccess } = useSubscription()
    const location = useLocation()

    const { showPaymentOverdue,
        setShowPaymentOverdue,
        showSubscriptionExpired,
        setShowSubscriptionExpired,
        showTrialExpired,
        setShowTrialExpired,
        showRenewalSuccess,
        showSubscriptionCanceled,
        setShowSubscriptionCanceled
    } = useSubscriptionModals();

    useEffect(() => {
        // Socket is now managed globally in App.tsx
        // No need to init here as it kills the global listener
    }, [loginUserDetail?.user?.id]);

    // Pages that should show NO sidebar/navbar (clean payment flow)
    const isPaymentFlow =
        location.pathname === '/select-plan' ||
        location.pathname === '/confirm-free-account' ||
        location.pathname === '/payment-checkout' ||
        location.pathname === '/payment-success' ||
        location.pathname === '/payment-failure';

    // Pages that are exempt from subscription restrictions but SHOULD show sidebar
    const isExempt =
        isPaymentFlow ||
        location.pathname.startsWith('/setting') ||
        location.pathname.startsWith('/notification') ||
        location.pathname.startsWith('/user-profile');

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    return (
        <div className=" h-screen flex ">
            {/* Fixed Sidebar - Only show if logged in AND not in clean payment flow */}
            {token && !isPaymentFlow && (
                <div
                    className={`
                    bg-white absolute md:relative z-50 transition-all duration-300 ease-in-out 
                    ${isSideBarClose ? 'left-0' : '-left-[1000px]'} 
                    md:left-0 
                   `}>
                    <Sidebar />
                </div>
            )}

            {/* Content area */}
            <div className={`grow bg-gray-100 overflow-auto ${token ? 'w-[80%]' : 'w-full'}`}>
                <div className=" w-full h-screen flex flex-col bg-dashboardMainBgColor">
                    {/* Fixed Navbar - Only show if logged in and not in clean payment flow */}
                    {token && !isPaymentFlow && (
                        <div className=" shadow-md z-40">
                            <EmailVerificationBanner />
                            <Navbar />
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto sm:p-2 bg-gray-100">
                        {token && !hasAccess && !isExempt ? (
                            isRefreshing ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C9993]"></div>
                                </div>
                            ) : location.pathname === '/dashboard' || location.pathname === '/' ? (
                                <div className="min-h-full">
                                    <PlanExpiredOverlay />
                                </div>
                            ) : location.pathname.startsWith('/clients') ? (
                                <GenericLockedPage 
                                    heading="Client List" 
                                    columns={["#", "Name", "Client ID", "Gender", "Email", "Status", "State", "Verified Status", "Provider Name", "Action"]} 
                                    label="Access to your client portfolio is currently locked." 
                                />
                            ) : location.pathname.startsWith('/providers') ? (
                                <GenericLockedPage 
                                    heading="Provider List" 
                                    columns={["#", "Name", "Email", "Role", "Specialty", "Status", "Action"]} 
                                    label="Access to the provider directory is currently locked." 
                                />
                            ) : location.pathname.startsWith('/chat') ? (
                                <DummyChatPage />
                            ) : location.pathname.startsWith('/invoices') ? (
                                <GenericLockedPage 
                                    heading="Invoices" 
                                    columns={["Invoice ID", "Date", "Amount", "Status", "Action"]} 
                                    label="Access to your billing history is currently locked." 
                                />
                            ) : location.pathname.startsWith('/invite-provider') ? (
                                <GenericLockedPage 
                                    heading="Invite Provider" 
                                    columns={["Email", "Role", "Status", "Date", "Action"]} 
                                    label="The provider invitation system is currently locked." 
                                />
                            ) : (
                                <GenericLockedPage 
                                    heading="Restricted View" 
                                    label="This section is currently locked due to inactive subscription." 
                                />
                            )
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </div>
            </div>

            {/* Subscription Modals - Only hide if in clean payment flow */}
            {!isPaymentFlow && (
                <>
                    {showPaymentOverdue && (
                        <PaymentOverDueModal 
                            onClose={() => setShowPaymentOverdue(false)} 
                            plan={loginUserDetail?.user?.subscription?.plan}
                        />
                    )}

                    {showSubscriptionExpired && (
                        <SubscriptionExpiredModal onClose={() => setShowSubscriptionExpired(false)} />
                    )}

                    {showTrialExpired && (
                        <TrialExpiredModal onClose={() => setShowTrialExpired(false)} />
                    )}

                    {showSubscriptionCanceled && (
                        <SubscriptionCanceledModal onClose={() => setShowSubscriptionCanceled(false)} />
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardLayout


// import PaymentOverDueModal from '../components/modals/PaymentOverdue';
// import SubscriptionExpiredModal from '../components/modals/SubscriptionExpiredModal';
// import TrialExpiredModal from '../components/modals/TrialExpiredModal';
// import { useSubscriptionModals } from '../hooks/useSubscriptionModals';

// const DashboardLayout = () => {
//     const {
//         showPaymentOverdue,
//         setShowPaymentOverdue,
//         showSubscriptionExpired,
//         setShowSubscriptionExpired,
//         showTrialExpired,
//         setShowTrialExpired,
//     } = useSubscriptionModals();

//     return (
//         <>
//             {/* Your existing layout */}
//             <div className="dashboard-layout">
//                 {/* ... */}
//             </div>

//             {/* Subscription Modals */}
//             {showPaymentOverdue && (
//                 <PaymentOverDueModal onClose={() => setShowPaymentOverdue(false)} />
//             )}
            
//             {showSubscriptionExpired && (
//                 <SubscriptionExpiredModal onClose={() => setShowSubscriptionExpired(false)} />
//             )}
            
//             {showTrialExpired && (
//                 <TrialExpiredModal onClose={() => setShowTrialExpired(false)} />
//             )}
//         </>
//     );
// };

