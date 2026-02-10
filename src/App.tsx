import './App.css'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import Routing from './routing/Routing'
import { useSelector } from 'react-redux'
import { RootState } from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { initSocket } from './socket/Socket'
import notification from "../src/assets/audio/notification.wav"


function App() {
  const queryClient = new QueryClient();
  const userId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId)



  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const token = localStorage.getItem("token");
  //     if (token && userId && role) {
  //       try {
  //         console.log("🔄 App.tsx: Refreshing user data...", { userId, role });
  //         const response = await authService.getMe(userId, role);
  //         if (response?.data?.data) {
  //           dispatch(saveLoginUserDetailsReducer(response.data.data));
  //           console.log("✅ App.tsx: User data refreshed. Status:", response.data.data?.user?.subscription?.status);
  //         } else if (response?.data) {
  //           // Fallback if structure is different (e.g. direct object)
  //           console.log("⚠️ App.tsx: response.data.data is missing, checking response.data", response.data);
  //           if (response.data.user) {
  //             dispatch(saveLoginUserDetailsReducer(response.data.user));
  //           } else {
  //             // If getMeApi returns { data: ... }, try that
  //             dispatch(saveLoginUserDetailsReducer(response.data));
  //           }
  //         }
  //       } catch (error) {
  //         console.error("❌ App.tsx: Failed to refresh user data", error);
  //       }
  //     }
  //   };

  //   fetchUserData();
  // }, [dispatch, userId, role]);

  useEffect(() => {
    if (userId) {
      const socket = initSocket("", userId);
      console.log("19 app.tsx");

      socket.on("new_notification", (data) => {
        console.log("22 app.tsx");

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(data.title, {
            body: data.message,
            icon: '/logo192.png',
            tag: `notif-${Date.now()}`
          });

          const audio = new Audio(notification);
          audio.play();
        } else {
          console.log("🔕 Notification blocked or unsupported");
        }
      });

      return () => {
        socket.off("new_notification");
        // disconnectSocket();
      };
    }
  }, [userId]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);


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
      </BrowserRouter>
    </QueryClientProvider>

  )
}

export default App

