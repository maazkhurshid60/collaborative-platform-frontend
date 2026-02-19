import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import { Outlet, useLocation } from 'react-router-dom'
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
        if (!loginUserDetail?.user?.id) return;

        const socket = getSocket();
        initSocket(loginUserDetail.user.id, "");

        return () => {
            socket?.disconnect(); // optional: cleanup if needed on unmount or user switch
        };
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
                            ) : (
                                <div className="min-h-full">
                                    <PlanExpiredOverlay />
                                </div>
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

