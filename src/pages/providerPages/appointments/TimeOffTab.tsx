import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  X,
  AlertCircle,
} from "lucide-react";

import Loader from "@/components/loader/Loader";
import {
  availabilityApiService,
  type TimeOffEntry,
} from "@/services/availabilityApiService";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarGridView } from "./CalendarGridView";
import { AppointmentRecord } from "@/services/appointmentApiService";
import { AppointmentDetailModal } from "./AppointmentDetailModal";

interface TimeOffFormState {
  startDate: string;
  endDate: string;
  reason: string;
}

type ViewMode = "week" | "month";

const TimeOffTab = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlotModal, setSelectedSlotModal] =
    useState<AppointmentRecord | null>(null);

  // Queries
  const { data: timeOffList = [], isLoading: isLoadingTimeOff } = useQuery<
    TimeOffEntry[]
  >({
    queryKey: ["availability", "timeOff"],
    queryFn: async () => {
      const response = await availabilityApiService.getTimeOff();
      return response?.data ?? [];
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm<TimeOffFormState>(
    {
      defaultValues: { startDate: "", endDate: "", reason: "" },
    },
  );

  const addMutation = useMutation({
    mutationFn: async (values: TimeOffFormState) =>
      availabilityApiService.addTimeOff({
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason || undefined,
      }),
    onSuccess: () => {
      toast.success("Time off scheduled successfully.");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      reset();
      setIsAddModalOpen(false);
    },
    onError: () => toast.error("Failed to add time off."),
  });

  const removeMutation = useMutation({
    mutationFn: async (timeOffId: string) =>
      availabilityApiService.removeTimeOff(timeOffId),
    onSuccess: () => {
      toast.success("Time off entry removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
    onError: () => toast.error("Failed to remove time off entry."),
  });

  // Cell click handler opens Add Time Off modal prefilled with clicked date
  const handleDayCellClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target < today) {
      toast.warning("Cannot schedule time-off for past dates.");
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    setValue("startDate", formattedDate);
    setValue("endDate", formattedDate);
    setIsAddModalOpen(true);
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

  if (isLoadingTimeOff) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Google Calendar Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        onViewModeChange={setViewMode}
        onSave={() => setIsAddModalOpen(true)}
        isSaving={false}
        dateRangeLabel={getHeaderDateString()}
      />

      {/* Top: Google Calendar Grid */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs min-h-150 flex flex-col">
        <CalendarGridView
          viewMode={viewMode}
          getWeekDays={getWeekDays}
          getDaysInMonthGrid={getDaysInMonthGrid}
          currentDate={currentDate}
          days={{}}
          isDayTimeOff={isDayTimeOff}
          isDayAvailable={() => false}
          getAppointmentsForDate={() => []}
          isToday={isToday}
          onDayClick={handleDayCellClick}
          onAppointmentClick={setSelectedSlotModal}
        />
      </div>

      {/* Bottom: Scheduled Time-Off List Panel */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={20} className="text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">
              Scheduled Time Off ({timeOffList.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="p-1 rounded-xl bg-primaryColorDark text-white hover:bg-[#237c76] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 shadow-xs"
          >
            <Plus size={15} /> Add Time Off
          </button>
        </div>

        {timeOffList.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 space-y-1.5">
            <CalendarIcon size={28} className="mx-auto text-gray-300" />
            <p className="font-semibold text-gray-600">No time off scheduled</p>
            <p className="text-[11px] text-gray-400">
              Click any day cell on the calendar above or use the button to
              schedule break time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {timeOffList.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 flex items-start justify-between gap-3 transition-all hover:bg-amber-100/60 hover:shadow-2xs"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-950 block">
                    {new Date(entry.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(entry.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {entry.reason && (
                    <p className="text-xs text-amber-800 font-medium leading-normal">
                      {entry.reason}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(entry.id)}
                  disabled={removeMutation.isPending}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                  title="Delete Time Off"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Time Off Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Schedule Time Off
                  </h3>
                  <p className="text-xs text-gray-500">
                    Block dates from receiving new client bookings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit((values) => addMutation.mutate(values))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    required
                    {...register("startDate", { required: true })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:bg-white focus:border-primaryColorDark outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    required
                    {...register("endDate", { required: true })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-800 focus:bg-white focus:border-primaryColorDark outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vacation, Conference, Personal Leave"
                  {...register("reason")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:border-primaryColorDark outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 py-2.5 bg-primaryColorDark text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#237c76] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={15} /> Save Time Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AppointmentDetailModal
        appointment={selectedSlotModal}
        onClose={() => setSelectedSlotModal(null)}
      />
    </div>
  );
};

export default TimeOffTab;
