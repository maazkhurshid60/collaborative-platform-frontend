import React from "react";
import { Trash2, Loader2 } from "lucide-react";

interface ClearAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ClearAllModal: React.FC<ClearAllModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto">
          <Trash2 size={24} />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-gray-900">
            Clear All Call Logs?
          </h3>
          <p className="text-xs text-gray-500">
            Are you sure you want to delete all call logs? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
