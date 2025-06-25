import { io, Socket } from "socket.io-client";

export let socket: Socket | undefined;
const url = import.meta.env.VITE_ENV === "LOCALHOST" ? import.meta.env.VITE_LOCAL_BASE_URL.split("/api")[0] : import.meta.env.VITE_RENDER_BASE_URL.split("/api")[0]
console.log("url", url);

export const initSocket = (providerId: string): Socket => {
    console.log("socket", socket);

    if (!socket) {
        socket = io(url, {
            query: { providerId },
            transports: ['websocket'],

            // transports: ['polling'],
            // secure: true,
            // // withCredentials: true,
            // reconnection: true,
            // reconnectionAttempts: 2,
            // reconnectionDelay: 2000,
            // timeout: 10000
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket?.id);
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Socket connection failed:', err.message);
            console.error('❌ Socket connection failed:front end');
        });
    } else if (!socket.connected) {
        socket.connect(); // Ensure it reconnects if disconnected
    }

    return socket;
};

export const getSocket = (): Socket | undefined => {

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        console.log('🛑 Socket disconnected');
    }
};



//Remove comment code from following files  on 16june monday aftre 10pm
// ClientDocShareModal
// GroupChatData
