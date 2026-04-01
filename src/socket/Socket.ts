import { io, Socket } from "socket.io-client";

export let socket: Socket | undefined;
export const VITE_LOCAL_BASE_URL = import.meta.env.VITE_LOCAL_BASE_URL;
const url = import.meta.env.VITE_ENV === "LOCALHOST" ? import.meta.env.VITE_LOCAL_BASE_URL.split("/api")[0] : import.meta.env.VITE_RENDER_BASE_URL.split("/api")[0]
// export const initSocket = (providerId: string, userId: string): Socket => {

//     if (!socket) {
//         socket = io(url, {
//             query: { providerId, userId: userId },
//             transports: ['websocket'],

//         });

//         socket.on('connect', () => {
//         });

//         socket.on('connect_error', (err) => {
//         });
//     } else if (!socket.connected) {
//         socket.connect(); // Ensure it reconnects if disconnected
//     }

//     return socket;
// };

// export const initSocket = (providerId: string, userId: string) => {
//     if (socket) {
//         socket.disconnect(); // destroy old socket
//     }

//     socket = io(url, {
//         query: { providerId, userId },
//         transports: ['websocket'],
//     });

//     socket.on('connect', () => {
//         console.log("Socket Initilized", socket?.id);
//     })

//     socket.on("connect_error", (err) => {
//         console.error("Socket error:", err)
//     })

//     return socket;
// }

export const initSocket = (providerId: string, userId: string): Socket => {
    if (!userId) {
        console.log("❌ Socket NOT initialized (no userId)");
        return socket as Socket;
    }

    // 🔥 PREVENT RE-INITIALIZATION IF IDs ARE THE SAME
    // This keeps the App.tsx listener from being killed by other components
    if (socket && socket.connected) {
        const currentQuery = (socket as any).io.opts.query;
        if (currentQuery.userId === userId && currentQuery.providerId === providerId) {
            console.log("♻️ Socket already initialized with same IDs. Skipping.");
            return socket;
        }
        console.log("🔄 IDs changed. Reconnecting socket.");
        socket.disconnect();
    }

    socket = io(url, {
        query: {
            providerId: providerId || "",
            userId: userId || "",
        },
        transports: ['polling', 'websocket'], // Allow polling for better compatibility
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    console.log("✅ Socket Initialized", socket.id, { providerId, userId });

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


