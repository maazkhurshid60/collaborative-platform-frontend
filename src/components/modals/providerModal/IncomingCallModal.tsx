import React from "react";
import { Phone, Video, X, Check } from "lucide-react";

export interface IncomingCallData {
  appointmentId: string;
  callType: "audio" | "video";
  callerName: string;
  callerProfileImage?: string;
  calleeJoinUrl: string;
}

interface IncomingCallModalProps {
  incomingCall: IncomingCallData | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  incomingCall,
  onAccept,
  onDecline,
}) => {
  React.useEffect(() => {
    if (!incomingCall) return;
    const timer = setTimeout(() => {
      onDecline();
    }, 30000);
    return () => clearTimeout(timer);
  }, [incomingCall, onDecline]);

  if (!incomingCall) return null;

  const isAudio = incomingCall.callType === "audio";

  return (
    <div className="fixed top-5 right-5 z-9999 flex w-96 animate-bounce-short items-center rounded-2xl border border-primaryColorDark/30 bg-white p-4 shadow-2xl transition-all dark:bg-gray-900">
      {/* Caller Profile Avatar */}
      <div className="relative shrink-0">
        <img
          src={
            incomingCall.callerProfileImage ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt={incomingCall.callerName}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-primaryColorDark/50"
        />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primaryColorDark text-white shadow-xs">
          {isAudio ? <Phone size={12} /> : <Video size={12} />}
        </span>
      </div>

      {/* Caller Info */}
      <div className="ml-3 flex-1 overflow-hidden">
        <h4 className="truncate text-sm font-bold text-textColor dark:text-white">
          {incomingCall.callerName}
        </h4>
        <p className="flex items-center gap-1 text-xs font-medium text-primaryColorDark">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Incoming {isAudio ? "Voice Call" : "Video Call"}...
        </p>
      </div>

      {/* Action Buttons */}
      <div className="ml-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onDecline}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
          title="Decline Call"
        >
          <X size={18} />
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer animate-pulse"
          title="Accept Call"
        >
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};

export default IncomingCallModal;
