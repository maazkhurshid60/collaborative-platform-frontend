import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useEffect } from 'react'
import { getSocket, initSocket } from '../../socket/Socket'
import { useSubscription } from '../../hooks/useSubscription'
import PlanExpiredOverlay from '../../components/pagesComponent/dashboard/plan-expired/PlanExpiredOverlay'

const DashboardLayout = () => {
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail?.userDetails)
    const { hasAccess } = useSubscription()
    const location = useLocation()

    useEffect(() => {
        if (!loginUserDetail?.user?.id) return;

        const socket = getSocket();
        initSocket(loginUserDetail.user.id, "");

        return () => {
            socket?.disconnect(); // optional: cleanup if needed on unmount or user switch
        };
    }, [loginUserDetail?.user?.id]);

    // Check if current route is exempt from restriction (only basic profile/settings or payment flow)
    const isExempt =
        location.pathname.startsWith('/setting') ||
        location.pathname.startsWith('/notification') ||
        location.pathname === '/select-plan' ||
        location.pathname === '/confirm-free-account' ||
        location.pathname === '/payment-checkout' ||
        location.pathname === '/payment-success' ||
        location.pathname === '/payment-failure' ||
        location.pathname.startsWith('/user-profile');

    const token = localStorage.getItem("token");

    return (
        <div className=" h-[100vh] flex ">
            {/* Fixed Sidebar - Only show if logged in */}
            {token && (
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
            <div className={`flex-grow bg-gray-100 overflow-auto ${token ? 'w-[80%]' : 'w-full'}`}>
                <div className=" w-full h-[100vh] flex flex-col bg-dashboardMainBgColor">
                    {/* Fixed Navbar - Only show if logged in (or we can keep it with a guest check) */}
                    {token && (
                        <div className=" shadow-md z-40">
                            <Navbar />
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto sm:p-2 bg-gray-100">
                        {token && !hasAccess && !isExempt ? (
                            <div className="min-h-full">
                                <PlanExpiredOverlay />
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardLayout
