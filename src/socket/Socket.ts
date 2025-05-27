
import { io, Socket } from "socket.io-client";
import { localhostBaseUrl, staggingBaseUrl } from "../apiServices/baseUrl/BaseUrl";
let socket: Socket | undefined;

export const initSocket = (providerId?: string, userId?: string): Socket => {
    if (socket) {
        socket.disconnect(); // ensure no stale socket
        socket = undefined;
    }


    const fileUrl = import.meta.env.VITE_ENV === "LOCALHOST" ? `${localhostBaseUrl}` : `${staggingBaseUrl}`;
    socket = io(`${fileUrl}`, {
        transports: ["websocket"],
        // query: { providerId, userId },
        query: {
            ...(userId && { userId }),          // ✅ only added if exists
            ...(providerId && { providerId }),  // ✅ only added if exists
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
