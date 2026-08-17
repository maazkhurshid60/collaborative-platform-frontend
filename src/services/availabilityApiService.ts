import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";

export interface WeeklyAvailabilityDay {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface BookingSettings {
    timezone: string | null;
    appointmentDurationMinutes: number;
    bufferMinutes: number;
}

export interface TimeOffEntry {
    id: string;
    startDate: string;
    endDate: string;
    reason?: string | null;
}

export const availabilityApiService = {
    getWeeklyAvailability: async () => {
        const response = await axiosInstance.get(`/availability/weekly`);
        return response.data;
    },
    setWeeklyAvailability: async (days: WeeklyAvailabilityDay[]) => {
        const response = await axiosInstance.put(`/availability/weekly`, { days });
        return response.data;
    },
    getBookingSettings: async () => {
        const response = await axiosInstance.get(`/availability/settings`);
        return response.data;
    },
    setBookingSettings: async (settings: Partial<BookingSettings>) => {
        const response = await axiosInstance.put(`/availability/settings`, settings);
        return response.data;
    },
    getTimeOff: async () => {
        const response = await axiosInstance.get(`/availability/time-off`);
        return response.data;
    },
    addTimeOff: async (data: { startDate: string; endDate: string; reason?: string }) => {
        const response = await axiosInstance.post(`/availability/time-off`, data);
        return response.data;
    },
    removeTimeOff: async (timeOffId: string) => {
        const response = await axiosInstance.delete(`/availability/time-off/${timeOffId}`);
        return response.data;
    },
};
