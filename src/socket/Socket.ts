

// import { io, Socket } from "socket.io-client";

// let socket: Socket;

// export const initSocket = (providerId: string) => {
//     if (!socket) {
//         socket = io("http://localhost:8000", {
//             transports: ["websocket"],
//             query: { providerId },
//         });
//     }
//     return socket;
// };

// export const getSocket = () => socket;
// export const disconnectSocket = () => {
//     if (socket) {
//         socket.disconnect();
//         socket = undefined as any; // clear the reference
//     }
// };



import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const initSocket = (providerId: string): Socket => {
    if (!socket) {
        socket = io("http://localhost:8000", {
            transports: ["websocket"],
            query: { providerId },
        });
    }
    return socket;
};

export const getSocket = (): Socket | undefined => socket;

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = undefined;
    }
};








































// import { io } from "socket.io-client";
// import store from "../redux/store";  // jahan se aap Redux store lete ho

// // Pehle loginUserId nikaalo
// const { userDetails } = store.getState().LoginUserDetail;
// const loginUserId = userDetails.id;

// const socket = io("http://localhost:8000", {
//     transports: ["websocket"],
//     query: { providerId: loginUserId },   // <-- yeh line add karo
// });

// export default socket;



// // src/socket/Socket.ts

// src/socket/Socket.ts
// src/socket/Socket.ts
// socket/Socket.ts
// socket/Socket.ts

// // src/socket/Socket.ts
// // src/socket/Socket.ts
// import { io, Socket } from "socket.io-client";

// let socket: Socket = io("", { autoConnect: false }); // default disconnected

// export function initSocket(providerId: string) {
//     // Tear down old connection if any
//     if (socket) socket.disconnect();

//     // Build new socket with providerId in query and autoConnect
//     socket = io("http://localhost:8000", {
//         transports: ["websocket"],
//         query: { providerId },
//         autoConnect: true,
//     });

//     return socket;
// }

// export function getSocket(): Socket {
//     return socket;
// }

