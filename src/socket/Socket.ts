
import { io, Socket } from "socket.io-client";
let socket: Socket | undefined;

export const initSocket = (providerId: string): Socket => {
    if (socket) {
        socket.disconnect(); // ensure no stale socket
        socket = undefined;
    }

    // socket = io("http://localhost:8000", {
    //     transports: ["websocket"],
    //     query: { providerId },
    // });
    socket = io("https://collaborative-platform-backend.onrender.com", {
        transports: ["websocket"],
        query: { providerId },
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
