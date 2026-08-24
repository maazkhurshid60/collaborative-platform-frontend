import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Video, PhoneMissed, PhoneCall, Clock, X } from "lucide-react";
import { appointmentApiService } from "@/services/appointmentApiService";
import Loader from "@/components/loader/Loader";

interface DirectCallLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProviderId: string;
  targetProviderName?: string;
  onStartCall?: (callType: "audio" | "video") => void;
}

export const DirectCallLogsModal: React.FC<DirectCallLogsModalProps> = ({
  isOpen,
  onClose,
  targetProviderId,
  targetProviderName = "Provider",
  onStartCall,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["directCallLogs", targetProviderId],
    queryFn: async () => {
      if (!targetProviderId) return [];
      const res = await appointmentApiService.getDirectCallLogs(targetProviderId);
      return res?.data ?? [];
    },
    enabled: isOpen && Boolean(targetProviderId),
  });

  if (!isOpen) return null;

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primaryColorLight/30 text-primaryColorDark">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Call History</h3>
              <p className="text-xs text-gray-500">With {targetProviderName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex py-12 justify-center">
              <Loader />
            </div>
          ) : !data || data.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <PhoneCall className="mx-auto mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium">No call logs found</p>
              <p className="text-xs text-gray-400 mt-1">
                Voice and video calls with {targetProviderName} will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.map((appt: any) => {
                const logs = appt.callLogs || [];
                const missedLog = logs.find((l: any) => l.event === "missed");
                const completedLog = logs.find((l: any) => l.event === "completed");
                const isMissed = Boolean(missedLog);
                const isAudio = appt.notes?.toLowerCase().includes("voice");

                return (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isMissed
                            ? "bg-red-50 text-red-500"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isMissed ? (
                          <PhoneMissed size={18} />
                        ) : isAudio ? (
                          <Phone size={18} />
                        ) : (
                          <Video size={18} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {isAudio ? "Voice Call" : "Video Call"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isMissed
                                ? "bg-red-100 text-red-600"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isMissed ? "Missed Call" : "Completed"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <span>
                            {new Date(appt.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {completedLog?.durationSeconds && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-emerald-700">
                                {formatDuration(completedLog.durationSeconds)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {onStartCall && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onStartCall(isAudio ? "audio" : "video");
                          }}
                          className="flex items-center gap-1 rounded-lg border border-primaryColorDark/30 bg-primaryColorLight/20 px-2.5 py-1 text-xs font-semibold text-primaryColorDark hover:bg-primaryColorDark hover:text-white transition-all cursor-pointer"
                        >
                          Call Back
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectCallLogsModal;
