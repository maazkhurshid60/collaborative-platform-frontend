import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Video, X } from "lucide-react";
import { appointmentApiService } from "@/services/appointmentApiService";
import Button from "@/components/button/Button";
import AvailableDatesPicker from "./bookSessionComponents/AvailableDatesPicker";
import AvailableTimeSlotsPicker from "./bookSessionComponents/AvailableTimeSlotsPicker";

interface BookProviderSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProvider: {
    id: string;
    name: string;
    slug?: string;
  };
}

export const BookProviderSessionModal: React.FC<
  BookProviderSessionModalProps
> = ({ isOpen, onClose, targetProvider }) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const providerSlugOrId = targetProvider.slug || targetProvider.id;

  // Query next 14 days of available slots
  const { fromIso, toIso } = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
    return { fromIso: from.toISOString(), toIso: to.toISOString() };
  }, [isOpen]);

  const { data: availabilityData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["providerSlots14Days", providerSlugOrId, fromIso],
    queryFn: async () => {
      if (!providerSlugOrId) return null;
      const res = await appointmentApiService.getPublicAvailableSlots(
        providerSlugOrId,
        fromIso,
        toIso,
      );
      return res?.data;
    },
    enabled: isOpen && Boolean(providerSlugOrId),
  });

  const allSlots: { startTime: string; endTime: string }[] = useMemo(() => {
    const rawSlots: { startTime: string; endTime: string }[] = availabilityData?.slots ?? [];
    return rawSlots.filter((slot) => {
      const minutes = new Date(slot.startTime).getMinutes();
      return minutes % 10 === 0;
    });
  }, [availabilityData]);

  // Group slots by Date string (YYYY-MM-DD)
  const groupedSlotsByDate = useMemo(() => {
    const map: Record<string, { startTime: string; endTime: string }[]> = {};
    for (const slot of allSlots) {
      const dateKey = slot.startTime.split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(slot);
    }
    return map;
  }, [allSlots]);

  const availableDateKeys = useMemo(() => {
    return Object.keys(groupedSlotsByDate).sort();
  }, [groupedSlotsByDate]);

  // Auto-select first available date when data loads
  useEffect(() => {
    if (
      availableDateKeys.length > 0 &&
      (!selectedDate || !groupedSlotsByDate[selectedDate])
    ) {
      setSelectedDate(availableDateKeys[0]);
    }
  }, [availableDateKeys, selectedDate, groupedSlotsByDate]);

  const slotsForSelectedDate = selectedDate
    ? (groupedSlotsByDate[selectedDate] ?? [])
    : [];

  const bookMutation = useMutation({
    mutationFn: async (startTime: string) => {
      return appointmentApiService.bookProviderAppointment({
        targetProviderId: targetProvider.id,
        startTime,
        sessionType: "ONLINE",
        notes,
      });
    },
    onSuccess: () => {
      toast.success(`Session request sent to ${targetProvider.name}!`);
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
      setSelectedSlot(null);
      setNotes("");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to book session.";
      toast.error(message);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header matching Availability Tab styling */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaryColorLight/40 text-primaryColorDark font-bold shadow-2xs">
              <Video size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Book Session with {targetProvider.name}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Select an available slot from {targetProvider.name}'s calendar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sub-component: Available Dates Picker */}
          <AvailableDatesPicker
            availableDateKeys={availableDateKeys}
            groupedSlotsByDate={groupedSlotsByDate}
            selectedDate={selectedDate}
            onSelectDate={(dateStr) => {
              setSelectedDate(dateStr);
              setSelectedSlot(null);
            }}
            isLoading={isLoadingSlots}
          />

          {/* Sub-component: Available Time Slots Picker */}
          {selectedDate && (
            <AvailableTimeSlotsPicker
              slotsForSelectedDate={slotsForSelectedDate}
              selectedSlot={selectedSlot}
              onSelectSlot={(startTime) => setSelectedSlot(startTime)}
            />
          )}

          {/* Notes / Agenda */}
          <div>
            <label className="mb-1.5 text-xs font-bold text-gray-700 block">
              Notes / Agenda <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide agenda details or reason for the consultation (Required)..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primaryColorDark focus:ring-2 focus:ring-primaryColorDark/20 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Action Buttons matching Availability Tab */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button text="Cancel" borderButton onclick={onClose} />
          <Button
            text={bookMutation.isPending ? "Booking..." : "Confirm Booking"}
            disabled={!selectedSlot || !notes.trim() || bookMutation.isPending}
            onclick={() => {
              if (!notes.trim()) {
                toast.error("Please provide notes / agenda for the session.");
                return;
              }
              if (selectedSlot) bookMutation.mutate(selectedSlot);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookProviderSessionModal;
