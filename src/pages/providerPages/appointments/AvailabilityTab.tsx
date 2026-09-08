import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Loader from "@/components/loader/Loader";
import {
  availabilityApiService,
  TimeOffEntry,
} from "@/services/availabilityApiService";
import {
  appointmentApiService,
  AppointmentRecord,
} from "@/services/appointmentApiService";
import {
  buildDefaultAvailabilityForm,
  DAY_LABELS,
  type AvailabilityFormState,
} from "./types";
import { EditDayModal, EditDayState } from "./EditDayModal";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarGridView } from "./CalendarGridView";

type ViewMode = "week" | "month";

const AvailabilityTab = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedSlotModal, setSelectedSlotModal] =
    useState<AppointmentRecord | null>(null);
  const [editingDay, setEditingDay] = useState<EditDayState | null>(null);

  // Queries
  const { data: weeklyAvailability, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["availability", "weekly"],
    queryFn: async () => {
      const response = await availabilityApiService.getWeeklyAvailability();
      return response?.data ?? [];
    },
  });

  const { data: bookingSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["availability", "settings"],
    queryFn: async () => {
      const response = await availabilityApiService.getBookingSettings();
      return response?.data;
    },
  });

  const { data: timeOffList = [] } = useQuery<TimeOffEntry[]>({
    queryKey: ["availability", "timeOff"],
    queryFn: async () => {
      const response = await availabilityApiService.getTimeOff();
      return response?.data ?? [];
    },
  });

  const { data: appointments = [] } = useQuery<AppointmentRecord[]>({
    queryKey: ["appointments", "all"],
    queryFn: async () => {
      const response = await appointmentApiService.getMyAppointments();
      return response?.data ?? [];
    },
  });

  // React Hook Form for settings and weekly hours
  const { handleSubmit, reset, watch, setValue, getValues } =
    useForm<AvailabilityFormState>({
      defaultValues: buildDefaultAvailabilityForm(),
    });

  useEffect(() => {
    if (!weeklyAvailability || !bookingSettings) return;

    const base = buildDefaultAvailabilityForm();
    for (const day of weeklyAvailability) {
      base.days[day.dayOfWeek] = {
        enabled: true,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
      };
    }
    base.timezone = bookingSettings.timezone ?? "";
    base.appointmentDurationMinutes =
      bookingSettings.appointmentDurationMinutes ?? 50;
    base.bufferMinutes = bookingSettings.bufferMinutes ?? 0;

    reset(base);
  }, [weeklyAvailability, bookingSettings, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: AvailabilityFormState) => {
      const enabledDays = values.days
        .filter((d) => d.enabled)
        .map((d) => ({
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
        }));

      await availabilityApiService.setWeeklyAvailability(enabledDays);
      await availabilityApiService.setBookingSettings({
        timezone: values.timezone,
        appointmentDurationMinutes: Number(values.appointmentDurationMinutes),
        bufferMinutes: Number(values.bufferMinutes),
      });
    },
    onSuccess: () => {
      toast.success("Availability updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: () => toast.error("Failed to save availability settings."),
  });

  const days = watch("days");

  // Handler for direct cell click on calendar day
  const handleDayCellClick = (dayDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dayDate);
    target.setHours(0, 0, 0, 0);

    if (target < today) {
      toast.warning("Availability for past dates cannot be edited.");
      return;
    }

    const dayOfWeek = dayDate.getDay();
    const dayConfig = days?.[dayOfWeek] || {
      enabled: false,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
    };

    setEditingDay({
      dayOfWeek,
      dayLabel: DAY_LABELS[dayOfWeek],
      enabled: dayConfig.enabled,
      startTime: dayConfig.startTime || "09:00",
      endTime: dayConfig.endTime || "17:00",
      dateStr: dayDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    });
  };

  // Save single day slot changes from modal
  const handleSaveEditingDay = () => {
    if (!editingDay) return;

    setValue(`days.${editingDay.dayOfWeek}.enabled`, editingDay.enabled);
    setValue(`days.${editingDay.dayOfWeek}.startTime`, editingDay.startTime);
    setValue(`days.${editingDay.dayOfWeek}.endTime`, editingDay.endTime);

    // Save directly to backend
    const currentValues = getValues();
    saveMutation.mutate(currentValues);
    setEditingDay(null);
  };

  // Date Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 7);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => setCurrentDate(new Date());

  // Date Utilities
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (date: Date) => isSameDay(date, new Date());

  const getHeaderDateString = () => {
    if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Week days array
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const daysArr = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      daysArr.push(day);
    }
    return daysArr;
  };

  // Month days array
  const getDaysInMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const daysArr = [];
    const curr = new Date(startDate);

    for (let i = 0; i < 35; i++) {
      daysArr.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return daysArr;
  };

  // Check if a day has time off scheduled
  const isDayTimeOff = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return timeOffList.some((to) => {
      const start = to.startDate.split("T")[0];
      const end = to.endDate.split("T")[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  // Helper to check if a day should display available slots based on recurrence mode
  const isDayAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayConfig = days?.[dayOfWeek];
    if (!dayConfig?.enabled) return false;

    // Check if recurrence is disabled
    const isRecurring = (bookingSettings as any)?.isRecurringWeekly ?? true;
    if (!isRecurring) {
      // Only show slots for days within the current real-world week
      const now = new Date();
      const startOfCurrentWeek = new Date(now);
      startOfCurrentWeek.setDate(now.getDate() - now.getDay());
      startOfCurrentWeek.setHours(0, 0, 0, 0);

      const endOfCurrentWeek = new Date(startOfCurrentWeek);
      endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
      endOfCurrentWeek.setHours(23, 59, 59, 999);

      const checkTime = date.getTime();
      return (
        checkTime >= startOfCurrentWeek.getTime() &&
        checkTime <= endOfCurrentWeek.getTime()
      );
    }

    return true;
  };

  // Get appointments on specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.startTime);
      return isSameDay(apptDate, date);
    });
  };

  if (isLoadingWeekly || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      className="space-y-4"
    >
      {/* Top Controls Bar Component */}
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        onViewModeChange={setViewMode}
        onSave={handleSubmit((values) => saveMutation.mutate(values))}
        isSaving={saveMutation.isPending}
        dateRangeLabel={getHeaderDateString()}
      />

      {/* Calendar Grid View Component */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs min-h-150 flex flex-col">
          <CalendarGridView
            viewMode={viewMode}
            getWeekDays={getWeekDays}
            getDaysInMonthGrid={getDaysInMonthGrid}
            currentDate={currentDate}
            days={days}
            isDayTimeOff={isDayTimeOff}
            isDayAvailable={isDayAvailable}
            getAppointmentsForDate={getAppointmentsForDate}
            isToday={isToday}
            onDayClick={handleDayCellClick}
            onAppointmentClick={setSelectedSlotModal}
          />
        </div>
      </div>

      {/* Edit Day Slot Modal Component */}
      <EditDayModal
        editingDay={editingDay}
        onClose={() => setEditingDay(null)}
        onChange={setEditingDay}
        onSave={handleSaveEditingDay}
        isSaving={saveMutation.isPending}
      />

      {/* Appointment Detail Modal Component */}
      <AppointmentDetailModal
        appointment={selectedSlotModal}
        onClose={() => setSelectedSlotModal(null)}
      />
    </form>
  );
};

export default AvailabilityTab;
