import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

export interface AppointmentRecord {
    id: string;
    startTime: string;
    endTime: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED";
    displayStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "COMPLETED";
    sessionType: "ONLINE" | "IN_PERSON" | "HOME_VISIT";
    guestName: string;
    guestEmail: string;
    guestPhone?: string | null;
    notes?: string | null;
}

export const appointmentApiService = {
    getMyAppointments: async (status?: string) => {
        const response = await axiosInstance.get(`/appointments/me`, {
            params: status ? { status } : undefined,
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
};
