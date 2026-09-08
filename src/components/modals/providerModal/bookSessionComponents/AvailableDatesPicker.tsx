import React, { useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface AvailableDatesPickerProps {
  availableDateKeys: string[];
  groupedSlotsByDate: Record<string, { startTime: string; endTime: string }[]>;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
  isLoading: boolean;
}

export const AvailableDatesPicker: React.FC<AvailableDatesPickerProps> = ({
  availableDateKeys,
  groupedSlotsByDate,
  selectedDate,
  onSelectDate,
  isLoading,
}) => {
  const datesContainerRef = useRef<HTMLDivElement>(null);

  const scrollDates = (direction: "left" | "right") => {
    if (datesContainerRef.current) {
      const offset = direction === "left" ? -220 : 220;
      datesContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Calendar size={14} className="text-primaryColorDark" /> Available Dates
        </label>

        {availableDateKeys.length > 3 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollDates("left")}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-primaryColorLight/20 hover:text-primaryColorDark transition-all cursor-pointer shadow-2xs"
              title="Scroll left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollDates("right")}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-primaryColorLight/20 hover:text-primaryColorDark transition-all cursor-pointer shadow-2xs"
              title="Scroll right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400">
          Fetching available calendar slots...
        </div>
      ) : availableDateKeys.length === 0 ? (
        <div className="rounded-xl bg-gray-50 py-6 text-center text-xs text-gray-500">
          No open availability slots found for the next 14 days.
        </div>
      ) : (
        <div
          ref={datesContainerRef}
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {availableDateKeys.map((dateStr) => {
            const dateObj = new Date(`${dateStr}T00:00:00`);
            const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const slotCount = groupedSlotsByDate[dateStr]?.length || 0;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                className={`flex flex-col items-center shrink-0 min-w-22 rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-primaryColorDark bg-primaryColorLight/20 text-primaryColorDark ring-2 ring-primaryColorDark/30 shadow-xs font-bold"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primaryColorDark/50 hover:bg-gray-50"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider opacity-80">{dayName}</span>
                <span className="text-xs font-semibold mt-0.5">{monthDay}</span>
                <span className="mt-1 text-[10px] text-gray-400">
                  {slotCount} slot{slotCount > 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableDatesPicker;
