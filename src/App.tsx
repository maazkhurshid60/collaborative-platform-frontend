import './App.css'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import Routing from './routing/Routing'
import { Provider } from 'react-redux'
import store from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


function App() {
  const queryClient = new QueryClient();

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







// // App.tsx

// import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import { initSocket, getSocket } from './socket/Socket';
// import { RootState } from './redux/store';
// import Routing from './routing/Routing';

// function App() {
//   const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
//   const queryClient = new QueryClient();

//   // 1) On mount: initialize socket with empty providerId
//   useEffect(() => {
//     initSocket("");
//   }, []);

//   // 2) Whenever loginUserId changes, re-init with the real ID
//   useEffect(() => {
//     initSocket(loginUserId || "");
//   }, [loginUserId]);

//   // 3) Only after socket is created, add your listeners
//   useEffect(() => {
//     const socket = getSocket();
//     if (!socket) return;

//     socket.on('connect', () => console.log('Socket connected'));
//     socket.on('connect_error', err => console.log('Socket error', err));

//     return () => {
//       socket.off('connect');
//       socket.off('connect_error');
//     };
//   }, []);

//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <Routing />
//         <ToastContainer
//           position="top-right"
//           autoClose={5000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick={false}
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="light"
//         />
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }

// export default App;

