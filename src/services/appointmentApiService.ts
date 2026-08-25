import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

export interface AppointmentRecord {
    id: string;
    providerId?: string;
    bookingProviderId?: string;
    startTime: string;
    endTime: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED";
    displayStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "COMPLETED";
    sessionType: "ONLINE" | "IN_PERSON" | "HOME_VISIT";
    guestName: string;
    guestEmail: string;
    guestPhone?: string | null;
    notes?: string | null;
    isMyBooking?: boolean;
    provider?: {
        id: string;
        userId: string;
        user?: { fullName?: string; email?: string; profileImage?: string };
        profile?: { slug?: string };
    };
    bookingProvider?: {
        id: string;
        userId: string;
        user?: { fullName?: string; email?: string; profileImage?: string };
        profile?: { slug?: string };
    };
}

export const appointmentApiService = {
    getMyAppointments: async (status?: string) => {
        const response = await axiosInstance.get(`/appointments/me`, {
            params: status ? { status } : undefined,
        });
        return response.data;
    },
    bookProviderAppointment: async (payload: {
        targetProviderId: string;
        startTime: string;
        sessionType: "ONLINE" | "IN_PERSON" | "HOME_VISIT";
        notes?: string;
    }) => {
        const response = await axiosInstance.post(`/appointments/book-provider`, payload);
        return response.data;
    },
    startInstantCall: async (payload: {
        targetProviderId: string;
        callType: "audio" | "video";
    }) => {
        const response = await axiosInstance.post(`/appointments/start-instant-call`, payload);
        return response.data;
    },
    getPublicAvailableSlots: async (slug: string, from?: string, to?: string) => {
        const response = await axiosInstance.get(`/appointments/public/${slug}/available-slots`, {
            params: { from, to },
        });
        return response.data;
    },
    cancelMyAppointment: async (appointmentId: string) => {
        const response = await axiosInstance.patch(`/appointments/me/${appointmentId}/cancel`);
        return response.data;
    },
    acceptMyAppointment: async (appointmentId: string) => {
        const response = await axiosInstance.patch(`/appointments/me/${appointmentId}/accept`);
        return response.data;
    },
    declineMyAppointment: async (appointmentId: string) => {
        const response = await axiosInstance.patch(`/appointments/me/${appointmentId}/decline`);
        return response.data;
    },
    resendAppointmentEmail: async (appointmentId: string) => {
        const response = await axiosInstance.post(`/appointments/me/${appointmentId}/resend-email`);
        return response.data;
    },
    getAppointmentShareLink: async (appointmentId: string) => {
        const response = await axiosInstance.get(`/appointments/me/${appointmentId}/share-link`);
        return response.data;
    },
    getCallJoinInfo: async (appointmentId: string) => {
        const response = await axiosInstance.get(`/appointments/me/${appointmentId}/call-join`);
        return response.data;
    },
    getDirectCallLogs: async (targetProviderId: string) => {
        const response = await axiosInstance.get(`/appointments/direct-call-logs`, {
            params: { targetProviderId },
        });
        return response.data;
    },
    getAllMyCallLogs: async () => {
        const response = await axiosInstance.get(`/appointments/my-call-logs`);
        return response.data;
    },
};
