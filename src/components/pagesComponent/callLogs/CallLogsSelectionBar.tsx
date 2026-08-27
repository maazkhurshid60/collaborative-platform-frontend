import React from "react";
import { CheckSquare, Square, Trash2, Loader2 } from "lucide-react";

interface CallLogsSelectionBarProps {
  isAllSelected: boolean;
  totalFilteredCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
  isBulkDeleting: boolean;
}

export const CallLogsSelectionBar: React.FC<CallLogsSelectionBarProps> = ({
  isAllSelected,
  totalFilteredCount,
  selectedCount,
  onToggleSelectAll,
  onBulkDelete,
  isBulkDeleting,
}) => {
  if (totalFilteredCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-600">
      <button
        type="button"
        onClick={onToggleSelectAll}
        className="flex items-center gap-2 font-semibold hover:text-gray-900 cursor-pointer"
      >
        {isAllSelected ? (
          <CheckSquare size={16} className="text-primaryColorDark" />
        ) : (
          <Square size={16} className="text-gray-400" />
        )}
        <span>
          {isAllSelected ? "Deselect All" : "Select All"} ({totalFilteredCount})
        </span>
      </button>

      {selectedCount > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-700">
            {selectedCount} selected
          </span>
          <button
            type="button"
            onClick={onBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {isBulkDeleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Delete Selected ({selectedCount})
          </button>
        </div>
      )}
    </div>
  );
};
