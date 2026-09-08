import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Loader2,
  X,
} from "lucide-react";

import {
  appointmentApiService,
  type AppointmentRecord,
} from "@/services/appointmentApiService";
import { getFormatedDateAndTime } from "@/utils/dataTimeUtils";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRecord | null;
}

interface SlotOption {
  startTime: string;
  label: string;
  category: "morning" | "afternoon" | "evening";
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const queryClient = useQueryClient();
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const displayTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlotISO, setSelectedSlotISO] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  // Generate 14 upcoming days starting from tomorrow
  const upcomingDays = useMemo(() => {
    const days: { dateKey: string; dateObj: Date; dayName: string; dayNum: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateKey = d.toISOString().split("T")[0];
      const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
      const dayNum = d.getDate();

      days.push({ dateKey, dateObj: d, dayName, dayNum });
    }
    return days;
  }, []);

  const activeDateKey = selectedDateKey || upcomingDays[0]?.dateKey;

  // Generate time slots for selected day (Morning 9-12, Afternoon 12-17, Evening 17-20)
  const timeSlotsForDate = useMemo(() => {
    if (!activeDateKey) return { morning: [], afternoon: [], evening: [] };

    const morning: SlotOption[] = [];
    const afternoon: SlotOption[] = [];
    const evening: SlotOption[] = [];

    const baseDate = new Date(`${activeDateKey}T00:00:00`);
    const hoursToGenerate = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

    for (const h of hoursToGenerate) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(h, 0, 0, 0);
      const iso = slotDate.toISOString();
      const label = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(slotDate);

      const option: SlotOption = {
        startTime: iso,
        label,
        category: h < 12 ? "morning" : h < 17 ? "afternoon" : "evening",
      };

      if (h < 12) morning.push(option);
      else if (h < 17) afternoon.push(option);
      else evening.push(option);
    }

    return { morning, afternoon, evening };
  }, [activeDateKey]);

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!appointment || !selectedSlotISO) {
        toast.error("Please select a new date and time.");
        return;
      }

      return appointmentApiService.rescheduleAppointment(appointment.id, {
        newStartTime: selectedSlotISO,
        reason: reason.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Appointment rescheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      handleClose();
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err?.response?.data?.message || "Failed to reschedule appointment.",
      );
    },
  });

  const handleClose = () => {
    setSelectedDateKey(null);
    setSelectedSlotISO(null);
    setReason("");
    onClose();
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs duration-200">
      <div className="animate-in zoom-in-95 relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8FBFA] text-[#2CB3A8]">
              <CalendarIcon size={16} />
            </div>
            <h3 className="font-heading text-[17px] font-bold text-[#0F172A]">
              Reschedule Appointment
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={rescheduleMutation.isPending}
            className="cursor-pointer rounded-full p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Event Summary Card */}
        <div className="mx-6 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Client Name
            </span>
            <span className="text-[13.5px] font-bold text-[#0F172A]">
              {appointment.guestName}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Current Scheduled Time
            </span>
            <span className="text-[13px] font-semibold text-[#2CB3A8]">
              {getFormatedDateAndTime(appointment.startTime)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-6 space-y-4 max-h-[75vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Date Picker Header */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
              Select New Date & Time Slot
            </span>
          </div>

          {/* Day Selector Strip */}
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {upcomingDays.map((day) => {
              const isSelected = day.dateKey === activeDateKey;
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() => {
                    setSelectedDateKey(day.dateKey);
                    setSelectedSlotISO(null);
                  }}
                  className={`flex min-w-16 cursor-pointer flex-col items-center justify-center rounded-2xl px-3 py-2.5 transition-all ${
                    isSelected
                      ? "scale-102 bg-[#2CB3A8] text-white shadow-md shadow-[#2CB3A8]/20"
                      : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1] hover:bg-[#EDF2F7]"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isSelected ? "text-white/80" : "text-[#64748B]"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="font-heading text-[18px] font-extrabold leading-tight">
                    {day.dayNum}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timezone Indicator */}
          <div className="flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="font-semibold text-[#334155]">Available Time Slots</span>
            <div className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1">
              <Globe size={12} className="text-[#2CB3A8]" />
              <span>{displayTimezone}</span>
            </div>
          </div>

          {/* Time Slots Grid (Morning / Afternoon / Evening) */}
          <div className="space-y-3">
            {/* Morning */}
            {timeSlotsForDate.morning.length > 0 && (
              <div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Morning
                </h4>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {timeSlotsForDate.morning.map((slot) => {
                    const isSelected = slot.startTime === selectedSlotISO;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlotISO(slot.startTime)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all ${
                          isSelected
                            ? "border-[#2CB3A8] bg-[#2CB3A8] text-white shadow-xs"
                            : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#2CB3A8] hover:bg-[#E8FBFA] hover:text-[#239B89]"
                        }`}
                      >
                        <span>{slot.label}</span>
                        <Clock
                          size={13}
                          className={isSelected ? "text-white" : "text-[#CBD5E1] group-hover:text-[#2CB3A8]"}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Afternoon */}
            {timeSlotsForDate.afternoon.length > 0 && (
              <div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Afternoon
                </h4>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {timeSlotsForDate.afternoon.map((slot) => {
                    const isSelected = slot.startTime === selectedSlotISO;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlotISO(slot.startTime)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all ${
                          isSelected
                            ? "border-[#2CB3A8] bg-[#2CB3A8] text-white shadow-xs"
                            : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#2CB3A8] hover:bg-[#E8FBFA] hover:text-[#239B89]"
                        }`}
                      >
                        <span>{slot.label}</span>
                        <Clock
                          size={13}
                          className={isSelected ? "text-white" : "text-[#CBD5E1] group-hover:text-[#2CB3A8]"}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evening */}
            {timeSlotsForDate.evening.length > 0 && (
              <div>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Evening
                </h4>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {timeSlotsForDate.evening.map((slot) => {
                    const isSelected = slot.startTime === selectedSlotISO;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlotISO(slot.startTime)}
                        className={`group flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all ${
                          isSelected
                            ? "border-[#2CB3A8] bg-[#2CB3A8] text-white shadow-xs"
                            : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#2CB3A8] hover:bg-[#E8FBFA] hover:text-[#239B89]"
                        }`}
                      >
                        <span>{slot.label}</span>
                        <Clock
                          size={13}
                          className={isSelected ? "text-white" : "text-[#CBD5E1] group-hover:text-[#2CB3A8]"}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#475569]">
              Reason / Note for Client <span className="font-normal text-[#94A3B8]">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Share reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full resize-none rounded-xl border border-[#CBD5E1] bg-white py-2 px-3 text-[13px] text-[#0F172A] transition-all placeholder:text-[#94A3B8] focus:border-[#2CB3A8] focus:ring-2 focus:ring-[#2CB3A8]/20 focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={rescheduleMutation.isPending}
              className="font-body cursor-pointer rounded-xl px-4 py-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => rescheduleMutation.mutate()}
              disabled={!selectedSlotISO || rescheduleMutation.isPending}
              className="font-body inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2CB3A8] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#239B89] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {rescheduleMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
