import React from "react";
import { Calendar as CalendarIcon, X, CheckCircle2 } from "lucide-react";
import Toggle from "@/components/toggle/Toggle";
import TimeSelect from "./TimeSelect";

export interface EditDayState {
  dayOfWeek: number;
  dayLabel: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  dateStr?: string;
}

interface EditDayModalProps {
  editingDay: EditDayState | null;
  onClose: () => void;
  onChange: (updated: EditDayState) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const EditDayModal: React.FC<EditDayModalProps> = ({
  editingDay,
  onClose,
  onChange,
  onSave,
  isSaving,
}) => {
  if (!editingDay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primaryColorLight/40 text-primaryColorDark font-bold">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Edit {editingDay.dayLabel} Availability
              </h3>
              {editingDay.dateStr && (
                <p className="text-xs text-gray-500 font-medium">
                  {editingDay.dateStr}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toggle Enable Status */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50">
          <span className="text-xs font-bold text-gray-800">
            Available on {editingDay.dayLabel}
          </span>
          <Toggle
            checked={editingDay.enabled}
            onChange={(e) =>
              onChange({ ...editingDay, enabled: e.target.checked })
            }
          />
        </div>

        {/* Time Slot Pickers */}
        {editingDay.enabled && (
          <div className="space-y-3 pt-1">
            <span className="text-xs font-bold text-gray-700 block">
              Working Hours
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">
                  Start Time
                </label>
                <TimeSelect
                  value={editingDay.startTime}
                  onChange={(val) =>
                    onChange({ ...editingDay, startTime: val })
                  }
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1">
                  End Time
                </label>
                <TimeSelect
                  value={editingDay.endTime}
                  onChange={(val) =>
                    onChange({ ...editingDay, endTime: val })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-primaryColorDark text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#237c76] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 size={15} /> Save Slot
          </button>
        </div>
      </div>
    </div>
  );
};
