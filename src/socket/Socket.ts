import { io, Socket } from "socket.io-client";

export let socket: Socket | undefined;
const url = import.meta.env.VITE_ENV === "LOCALHOST" ? import.meta.env.VITE_LOCAL_BASE_URL.split("/api")[0] : import.meta.env.VITE_RENDER_BASE_URL.split("/api")[0]
export const initSocket = (providerId: string, userId: string): Socket => {

    if (!socket) {
        socket = io(url, {
            query: { providerId, userId: userId },
            transports: ['websocket'],

        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:');
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
        console.error('🛑 Socket disconnected');
    }
};


