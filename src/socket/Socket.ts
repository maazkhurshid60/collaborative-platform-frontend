
import { io, Socket } from "socket.io-client";
let socket: Socket | undefined;

export const initSocket = (providerId: string, userId?: string): Socket => {
    if (!socket || !socket.connected) {
        socket = io('https://collaborative-platform-backend.onrender.com', {
            query: {
                providerId,
                userId,
            },
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket?.id);
        });

        socket.on('connect_error', (err) => {
            console.error('❌ Socket connection failed:', err.message);
        });
    }

    return socket;
};

export const getSocket = (): Socket | undefined => {
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
    }
};



