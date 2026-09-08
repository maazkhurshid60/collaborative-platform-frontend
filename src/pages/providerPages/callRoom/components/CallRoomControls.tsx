import React from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Minimize2, Loader2 } from "lucide-react";

interface CallRoomControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isRequestingVideo?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeaveCall: () => void;
  onMinimize?: () => void;
}

export const CallRoomControls: React.FC<CallRoomControlsProps> = ({
  isMuted,
  isCameraOff,
  isRequestingVideo = false,
  onToggleMute,
  onToggleCamera,
  onLeaveCall,
  onMinimize,
}) => {
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggleMute}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all cursor-pointer ${
          isMuted ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      <button
        type="button"
        onClick={onToggleCamera}
        disabled={isRequestingVideo}
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isCameraOff ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        title={isCameraOff ? "Turn camera on" : "Turn camera off"}
      >
        {isRequestingVideo ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isCameraOff ? (
          <VideoOff size={18} />
        ) : (
          <Video size={18} />
        )}
      </button>

      {onMinimize && (
        <button
          type="button"
          onClick={onMinimize}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 cursor-pointer"
          title="Minimize call"
        >
          <Minimize2 size={18} />
        </button>
      )}

      <button
        type="button"
        onClick={onLeaveCall}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white transition-all hover:bg-rose-600 cursor-pointer shadow-md"
        title="End Call"
      >
        <PhoneOff size={18} />
      </button>
    </div>
  );
};

export default CallRoomControls;
