import './App.css'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import Routing from './routing/Routing'
import { Provider } from 'react-redux'
import store from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'



function App() {
  const queryClient = new QueryClient();
  // const userId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.userId)

  // useEffect(() => {
  //   if (userId) {
  //     const socket = initSocket(userId); // init once

  //     socket.on("new_notification", (data) => {
  //       toast.info(`${data.title}: ${data.message}`);
  //     });

  //     return () => {
  //       socket.off("new_notification");
  //       disconnectSocket();
  //     };
  //   }
  // }, [userId]);

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

