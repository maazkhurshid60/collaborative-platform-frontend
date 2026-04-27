import './App.css'
import { ToastContainer, toast } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import Routing from './routing/Routing'
import { useSelector } from 'react-redux'
import { RootState } from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { initSocket, socket } from './socket/Socket'
import notification from "../src/assets/audio/notification.wav"
import authService from './apiServices/authApi/AuthApi'
import { saveLoginUserDetailsReducer, setIsRefreshing } from './redux/slices/LoginUserDetailSlice'
import RenewalSuccessfullModal from './components/modals/RenowalSuccessfullModal'
import InvoiceModal from './components/modals/InvoiceModal'
import { subscriptionApiService } from './services/subscriptionApiService'
import { useDispatch } from 'react-redux'
const queryClient = new QueryClient();

function App() {
  const userId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId)
  const role = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.role)
  const dispatch = useDispatch();
  const [showRenwalModal, setShowRenwalModal] = useState(false);
  const [renewalData, setRenewalData] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [latestInvoiceData, setLatestInvoiceData] = useState<any>(null);
  const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);

  const handleViewLatestReceipt = async () => {
    if (isFetchingReceipt) return;
    setIsFetchingReceipt(true);
    try {
      const payments = await subscriptionApiService.getAllPayments();
      if (Array.isArray(payments) && payments.length > 0) {
        // Backend returns payments sorted desc by createdAt — first is latest
        setLatestInvoiceData(payments[0]);
        setShowInvoiceModal(true);
      } else {
        toast.error("No invoice found yet. Please refresh in a moment.");
      }
    } catch (err) {
      console.error("Failed to fetch latest invoice:", err);
      toast.error("Could not load the latest receipt.");
    } finally {
      setIsFetchingReceipt(false);
    }
  };

  const providerId = useSelector((state: RootState) => state?.LoginUserDetail.userDetails?.user?.id)

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (token && userId && role) {
      try {
        dispatch(setIsRefreshing(true));
        const response = await authService.getMe(userId, role);
        if (response?.data?.data && response.data.data.user) {
          dispatch(saveLoginUserDetailsReducer(response.data.data));
        } else if (response?.data && response.data.user) {
          // Fallback if structure is different (e.g. direct object)
          dispatch(saveLoginUserDetailsReducer(response.data));
        } else if (response?.user) {
          dispatch(saveLoginUserDetailsReducer(response));
        } else {
        }
      } catch (error) {
      } finally {
        dispatch(setIsRefreshing(false));
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [dispatch, userId, role]);

  // useEffect(() => {
  //   if (userId) {
  //     const socket = initSocket("", userId);
  //     socket.on("new_notification", (data) => {
  //       if ("Notification" in window && Notification.permission === "granted") {
  //         new Notification(data.title, {
  //           body: data.message,
  //           icon: '/logo192.png',
  //           tag: `notif-${Date.now()}`
  //         });

  //         const audio = new Audio(notification);
  //         audio.play();
  //       }
  //     });

  //     // Listen for subscription updates
  //     socket.on("subscription_updated", () => {
  //       fetchUserData();
  //     });

  //     // Listen for subscription renewal success
  //     socket.on("subscription_renewal", (data) => {
  //       setRenewalData(data);
  //       setShowRenwalModal(true);
  //       fetchUserData();
  //     });

  //     return () => {
  //       socket.off("new_notification");
  //       socket.off("subscription_updated");
  //       socket.off("subscription_renewal");
  //       // disconnectSocket();
  //     };
  //   }
  // }, [userId]);


  // useEffect(() => {
  //   if (userId) {
  //     const socketInstance = initSocket(
  //       role === "provider" ? providerId : "",
  //       userId
  //     );


  //     socketInstance.on("new_notification", (data) => {
  //       queryClient.invalidateQueries({ queryKey: ['notifications'] });

  //       if ("Notification" in window && Notification.permission === "granted") {
  //         new Notification(data.title, {
  //           body: data.message,
  //           icon: "/logo192.png",
  //         });

  //         const audio = new Audio(notification);
  //         audio.play()
  //       }
  //     })

  //     return () => {
  //       socketInstance.off("new_notification")
  //     }
  //   }
  // }, [userId, role, providerId])

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);


  useEffect(() => {
    if (!userId) return; // 🔥 STOP if no userId

    const socketInstance = initSocket(
      role === "provider" ? providerId : "",
      userId
    );

    socketInstance.on("connect", () => {
      console.log("✅ Connected with:", { userId, providerId });
    });

    socketInstance.on("new_notification", (data) => {
      console.log("🔥 Notification received:", data);

      // 🔥 Failsafe: Only show if this user is the intended recipient
      if (data.recipientId && data.recipientId !== userId) {
        console.log("🚫 Ignoring notification meant for another user:", data.recipientId);
        return;
      }

      // 1. Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // 2. Play notification sound & show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.title || "Notification", {
          body: data.message,
          icon: `/fevicon.png?v=${Date.now()}`,
        });

        const audio = new Audio(notification);
        audio.play().catch(e => console.error("Audio play failed:", e));
      } else {
        // Fallback sound if browser notifications are disabled but app is open
        const audio = new Audio(notification);
        audio.play().catch(e => console.error("Audio play failed:", e));
      }
    });

    // Subscription renewal — opens the success modal when Stripe renews the plan
    socketInstance.on("subscription_renewal", (data) => {
      console.log("🔁 Subscription renewal received:", data);
      setRenewalData(data);
      setShowRenwalModal(true);
      fetchUserData();
    });

    // Subscription state changed (created / cancelled / updated) — just refresh user
    socketInstance.on("subscription_updated", () => {
      console.log("🔄 Subscription updated");
      fetchUserData();
    });

    return () => {
      socketInstance.off("subscription_renewal");
      socketInstance.off("subscription_updated");
      socketInstance.disconnect(); // 🔥 IMPORTANT
    };
  }, [userId, role, providerId]);

  return (
    <QueryClientProvider client={queryClient}>

      <BrowserRouter>
        <Routing />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {/* Renewal Success Modal */}
        {showRenwalModal && (
          <RenewalSuccessfullModal
            onClose={() => setShowRenwalModal(false)}
            planName={renewalData?.planName}
            amountBilled={renewalData?.amountBilled}
            nextBillingDate={renewalData?.nextBillingDate}
            onViewReceipt={handleViewLatestReceipt}
          />
        )}

        {/* Latest Invoice Receipt Modal (opened from "View Receipt" in renewal modal) */}
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setLatestInvoiceData(null);
          }}
          invoiceId={latestInvoiceData?.id ?? null}
          invoiceData={latestInvoiceData}
        />
      </BrowserRouter>
    </QueryClientProvider>

  )
}

export default App

