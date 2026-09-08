import React from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: "week" | "month";
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewModeChange: (mode: "week" | "month") => void;
  onSave: () => void;
  isSaving: boolean;
  dateRangeLabel: string;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentDate,
  viewMode,
  onToday,
  onPrev,
  onNext,
  onViewModeChange,
  onSave,
  isSaving,
  dateRangeLabel,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToday}
          className="px-3.5 py-1.5 border border-gray-300 text-xs font-semibold rounded-full text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
        >
          Today
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-all cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <span className="text-base font-bold text-gray-800 tracking-tight">
          {dateRangeLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* View switcher */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === "week"
                ? "bg-white text-primaryColorDark font-bold shadow-xs"
                : "text-gray-600"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("month")}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === "month"
                ? "bg-white text-primaryColorDark font-bold shadow-xs"
                : "text-gray-600"
            }`}
          >
            Month
          </button>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded-xl bg-primaryColorDark px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#237c76] disabled:opacity-50 cursor-pointer"
        >
          <Check size={14} /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};
