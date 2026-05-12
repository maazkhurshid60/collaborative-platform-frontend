import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";

interface PhiAttestationModalProps {
  onClose: () => void;
  onConfirm: (data: { isPhi: boolean; phiClientId?: string }) => void;
  clients: Array<{ id: string; user: { fullName: string } }>;
  isMedia: boolean;
}

const PhiAttestationModal: React.FC<PhiAttestationModalProps> = ({
  onClose,
  onConfirm,
  clients,
  isMedia,
}) => {
  const [isPhi, setIsPhi] = useState(isMedia); // Default to true if media is attached
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleConfirm = () => {
    onConfirm({
      isPhi,
      phiClientId: isPhi ? selectedClientId : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-lg">⚠️</span>
            </div>
            <h2 className="text-white font-bold text-lg">PHI Attestation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
            aria-label="Close"
          >
            <RxCross2 size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Does this message or attachment contain{" "}
            <strong className="text-gray-900">Protected Health Information (PHI)</strong>?
          </p>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={isPhi}
                onChange={() => setIsPhi(true)}
                className="w-4 h-4 text-amber-600"
              />
              <span className="text-sm font-medium text-gray-700">Yes, it contains PHI</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!isPhi}
                onChange={() => setIsPhi(false)}
                className="w-4 h-4 text-amber-600"
              />
              <span className="text-sm font-medium text-gray-700">No PHI</span>
            </label>
          </div>

          {isPhi && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Associate with Client (ROI Attestation)
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.user.fullName}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg leading-tight">
                By selecting a client, you attest that a valid **Release of Information (ROI)** is in place for this disclosure.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPhi && !selectedClientId}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
              isPhi && !selectedClientId
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            Confirm & Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhiAttestationModal;
