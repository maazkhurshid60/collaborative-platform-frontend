import React, { memo } from "react";
import {
  Phone,
  Video,
  PhoneMissed,
  PhoneOutgoing,
  PhoneIncoming,
  User,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { getFormatedDateAndTime } from "@/utils/dataTimeUtils";

interface CallLogItemProps {
  appt: any;
  loginUserId?: string;
  loginProviderId?: string;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDeleteSingle: (id: string) => void;
  onStartCall: (params: {
    targetProviderId: string;
    callType: "audio" | "video";
  }) => void;
  isDeleting: boolean;
  isCalling: boolean;
}

const formatDuration = (seconds?: number | null) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

export const CallLogItem: React.FC<CallLogItemProps> = memo(
  ({
    appt,
    loginUserId,
    loginProviderId,
    isSelected,
    onToggleSelect,
    onDeleteSingle,
    onStartCall,
    isDeleting,
    isCalling,
  }) => {
    const logs = appt.callLogs || [];
    const completedLog = logs.find((l: any) => l.event === "completed");
    const missedLog = logs.find((l: any) => l.event === "missed");
    const isCompleted = Boolean(completedLog);
    const isMissed =
      Boolean(missedLog) ||
      (!isCompleted && new Date(appt.createdAt).getTime() < Date.now() - 40000);
    const isAudio = appt.notes?.toLowerCase().includes("voice");

    const isCaller =
      appt.bookingProvider?.userId === loginUserId ||
      appt.bookingProvider?.id === loginProviderId;
    const otherParty = isCaller
      ? appt.provider
      : appt.bookingProvider || {
          user: {
            fullName: appt.guestName,
            email: appt.guestEmail,
          },
        };

    const otherName =
      otherParty?.user?.fullName || appt.guestName || "Provider";
    const otherEmail = otherParty?.user?.email || appt.guestEmail || "";
    const otherAvatar = otherParty?.user?.profileImage;
    const targetProviderId = isCaller
      ? appt.provider?.id
      : appt.bookingProvider?.id || appt.providerId;

    return (
      <div
        className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isSelected ? "bg-teal-50/40" : "hover:bg-gray-50/80"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => onToggleSelect(appt.id)}
            className="text-gray-400 hover:text-primaryColorDark cursor-pointer"
          >
            {isSelected ? (
              <CheckSquare size={18} className="text-primaryColorDark" />
            ) : (
              <Square size={18} />
            )}
          </button>

          {/* Avatar */}
          <div className="relative">
            {otherAvatar && otherAvatar !== "null" ? (
              <img
                src={otherAvatar}
                alt={otherName}
                className="h-11 w-11 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                <User size={20} />
              </div>
            )}
            <div
              className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${
                isMissed ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
              }`}
            >
              {isMissed ? (
                <PhoneMissed size={10} />
              ) : isCaller ? (
                <PhoneOutgoing size={10} />
              ) : (
                <PhoneIncoming size={10} />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 capitalize">
                {otherName}
              </h4>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isCaller
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-purple-50 text-purple-600 border border-purple-100"
                }`}
              >
                {isCaller ? "Outgoing" : "Incoming"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isMissed
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isMissed ? "Missed Call" : "Completed"}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-0.5">{otherEmail}</p>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1 font-medium text-gray-600">
                {isAudio ? <Phone size={12} /> : <Video size={12} />}
                {isAudio ? "Voice Call" : "Video Call"}
              </span>
              <span>•</span>
              <span>{getFormatedDateAndTime(appt.startTime)}</span>
              {completedLog?.durationSeconds && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-emerald-600">
                    Duration: {formatDuration(completedLog.durationSeconds)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {targetProviderId && (
            <>
              <button
                type="button"
                disabled={isCalling}
                onClick={() =>
                  onStartCall({ targetProviderId, callType: "audio" })
                }
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
              >
                <Phone size={13} /> Call Back (Voice)
              </button>
              <button
                type="button"
                disabled={isCalling}
                onClick={() =>
                  onStartCall({ targetProviderId, callType: "video" })
                }
                className="flex items-center gap-1.5 rounded-xl border border-primaryColorDark/30 bg-primaryColorLight/30 px-3 py-1.5 text-xs font-bold text-primaryColorDark hover:bg-primaryColorDark hover:text-white transition-all cursor-pointer"
              >
                <Video size={13} /> Call Back (Video)
              </button>
            </>
          )}

          {/* Single Delete Icon Button */}
          <button
            type="button"
            onClick={() => onDeleteSingle(appt.id)}
            disabled={isDeleting}
            title="Delete Call Log"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin text-red-600" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>
    );
  },
);

CallLogItem.displayName = "CallLogItem";
