import React, { useRef } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";

interface AvailableTimeSlotsPickerProps {
  slotsForSelectedDate: { startTime: string; endTime: string }[];
  selectedSlot: string | null;
  onSelectSlot: (startTime: string) => void;
}

export const AvailableTimeSlotsPicker: React.FC<AvailableTimeSlotsPickerProps> = ({
  slotsForSelectedDate,
  selectedSlot,
  onSelectSlot,
}) => {
  const timesContainerRef = useRef<HTMLDivElement>(null);

  const scrollTimes = (direction: "up" | "down") => {
    if (timesContainerRef.current) {
      const offset = direction === "up" ? -100 : 100;
      timesContainerRef.current.scrollBy({ top: offset, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Clock size={14} className="text-primaryColorDark" /> Available Time Slots
        </label>

        {slotsForSelectedDate.length > 6 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollTimes("up")}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-primaryColorLight/20 hover:text-primaryColorDark transition-all cursor-pointer shadow-2xs"
              title="Scroll up"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollTimes("down")}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-primaryColorLight/20 hover:text-primaryColorDark transition-all cursor-pointer shadow-2xs"
              title="Scroll down"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>

      {slotsForSelectedDate.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-4 text-center text-xs text-gray-500">
          No time slots available for this date.
        </div>
      ) : (
        <div
          ref={timesContainerRef}
          className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {slotsForSelectedDate.map((slot) => {
            const timeFormatted = new Date(slot.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isSelected = selectedSlot === slot.startTime;
            return (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => onSelectSlot(slot.startTime)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "border-primaryColorDark bg-primaryColorDark text-white shadow-xs"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primaryColorDark hover:bg-primaryColorLight/20"
                }`}
              >
                {timeFormatted}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableTimeSlotsPicker;
