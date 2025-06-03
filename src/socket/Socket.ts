
import { io, Socket } from "socket.io-client";
let socket: Socket | undefined;

export const initSocket = (providerId?: string, userId?: string): Socket => {
    if (socket) {
        socket.disconnect(); // ensure no stale socket
        socket = undefined;
    }


    // const fileUrl = import.meta.env.VITE_ENV === "LOCALHOST" ? `${localhostBaseUrl}` : `${staggingBaseUrl}`;
    // socket = io(`${fileUrl}`, {
    //     transports: ["websocket"],
    //     // query: { providerId, userId },
    //     query: {
    //         ...(userId && { userId }),          // ✅ only added if exists
    //         ...(providerId && { providerId }),  // ✅ only added if exists
    //     },
    // });
    socket = io(`https://collaborative-platform-backend.onrender.com/`, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,       // Retry 5 times
        reconnectionDelay: 2000,       // Wait 2s between retries
        query: {
            ...(userId && { userId }),
            ...(providerId && { providerId }),
        },
    });




    return socket;
};

export const getSocket = (): Socket | undefined => socket;

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = undefined;
    }
};



