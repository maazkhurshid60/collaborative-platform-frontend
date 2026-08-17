export const DAY_LABELS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export const SESSION_LENGTH_OPTIONS = [15, 20, 30, 45, 50, 60, 90];

export interface AvailabilityDayFormState {
    enabled: boolean;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface AvailabilityFormState {
    timezone: string;
    appointmentDurationMinutes: number;
    bufferMinutes: number;
    days: AvailabilityDayFormState[];
}

export function buildDefaultAvailabilityForm(): AvailabilityFormState {
    return {
        timezone: "",
        appointmentDurationMinutes: 50,
        bufferMinutes: 0,
        days: DAY_LABELS.map((_, dayOfWeek) => ({
            enabled: false,
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
        })),
    };
}
