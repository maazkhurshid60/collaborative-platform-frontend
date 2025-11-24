import './App.css'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import Routing from './routing/Routing'
import { Provider, useSelector } from 'react-redux'
import store, { RootState } from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { initSocket } from './socket/Socket'

import notification from "../src/assets/audio/notification.wav"
function App() {
  const queryClient = new QueryClient();
  const userId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId)

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
    console.log("46 app.tsx");

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);


  return (
    <QueryClientProvider client={queryClient}>

      <Provider store={store}>
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
      </Provider>
    </QueryClientProvider>

  )
}

export default App

