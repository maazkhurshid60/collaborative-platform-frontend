import React from "react";
import { Search, Trash2, Loader2 } from "lucide-react";

export type FilterType = "ALL" | "MISSED" | "COMPLETED" | "AUDIO" | "VIDEO";

interface CallLogsFilterBarProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasCallSessions: boolean;
  onOpenClearAll: () => void;
  isClearingAll: boolean;
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "All Calls", value: "ALL" },
  { label: "Missed", value: "MISSED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Voice Calls", value: "AUDIO" },
  { label: "Video Calls", value: "VIDEO" },
];

export const CallLogsFilterBar: React.FC<CallLogsFilterBarProps> = ({
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
  hasCallSessions,
  onOpenClearAll,
  isClearingAll,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterType === filter.value
                ? "bg-primaryColorDark text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Box & Clear All Button */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search caller name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-primaryColorDark focus:outline-none"
          />
        </div>

        {hasCallSessions && (
          <button
            type="button"
            onClick={onOpenClearAll}
            disabled={isClearingAll}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-2xs disabled:opacity-50"
          >
            {isClearingAll ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Clear All Logs
          </button>
        )}
      </div>
    </div>
  );
};
