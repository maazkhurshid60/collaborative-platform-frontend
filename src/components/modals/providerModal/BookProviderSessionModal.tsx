import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { X } from "lucide-react";
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
    return availabilityData?.slots ?? [];
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
    if (availableDateKeys.length > 0 && (!selectedDate || !groupedSlotsByDate[selectedDate])) {
      setSelectedDate(availableDateKeys[0]);
    }
  }, [availableDateKeys, selectedDate, groupedSlotsByDate]);

  const slotsForSelectedDate = selectedDate
    ? groupedSlotsByDate[selectedDate] ?? []
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-textColor">
              Schedule Call with {targetProvider.name}
            </h3>
            <p className="text-xs text-textGreyColor">
              Select an available slot from {targetProvider.name}'s calendar
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
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
            <label className="mb-1 text-xs font-semibold text-gray-700">
              Notes / Agenda (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add brief details or reason for the consultation..."
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-textColor focus:border-primaryColorDark focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button text="Cancel" borderButton onclick={onClose} />
          <Button
            text={bookMutation.isPending ? "Booking..." : "Confirm Booking"}
            disabled={!selectedSlot || bookMutation.isPending}
            onclick={() => {
              if (selectedSlot) bookMutation.mutate(selectedSlot);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookProviderSessionModal;
