
import { io, Socket } from "socket.io-client";
let socket: Socket | undefined;

export const initSocket = (providerId?: string, userId?: string): Socket => {
    if (socket) {
        socket.disconnect(); // ensure no stale socket
        socket = undefined;
    }


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



