import './App.css'
import { toast, ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import Routing from './routing/Routing'
import { Provider, useSelector } from 'react-redux'
import store, { RootState } from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { initSocket } from './socket/Socket'


function App() {
  const queryClient = new QueryClient();
  const userId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.userId)

  useEffect(() => {
    if (userId) {
      const socket = initSocket(userId); // init once

      socket.on("new_notification", (data) => {
        console.log("data", data);

        toast.info(`${data.title}: ${data.message}`);
      });

      return () => {
        socket.off("new_notification");
        // disconnectSocket();
      };
    }
  }, [userId]);

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

