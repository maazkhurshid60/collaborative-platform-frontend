import React from "react";
import { Maximize2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useDraggable } from "./useDraggable";

const WIDGET_WIDTH = 220;
const WIDGET_HEIGHT = 72;

interface FloatingCallWidgetProps {
  participantName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isRequestingVideo: boolean;
  callDurationSeconds: number;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onLeaveCall: () => void;
  onExpand: () => void;
}

const formatTimer = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const FloatingCallWidget: React.FC<FloatingCallWidgetProps> = ({
  participantName,
  isMuted,
  isCameraOff,
  isRequestingVideo,
  callDurationSeconds,
  onToggleMute,
  onToggleCamera,
  onLeaveCall,
  onExpand,
}) => {
  const { position, onPointerDown } = useDraggable(
    { x: window.innerWidth - WIDGET_WIDTH - 24, y: 24 },
    { width: WIDGET_WIDTH, height: WIDGET_HEIGHT },
  );

  return (
    <div
      style={{ left: position.x, top: position.y, width: WIDGET_WIDTH }}
      className="fixed z-50 flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/95 p-2.5 shadow-2xl backdrop-blur-sm select-none"
    >
      <button
        type="button"
        onPointerDown={onPointerDown}
        onDoubleClick={onExpand}
        title="Drag to move, double-click to expand"
        className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-full bg-emerald-600 text-white active:cursor-grabbing"
      >
        <span className="text-xs font-bold">{participantName.charAt(0).toUpperCase()}</span>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-white">{participantName}</p>
        <p className="text-[10px] text-emerald-400">
          {isRequestingVideo ? "Requesting video..." : formatTimer(callDurationSeconds)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
            isMuted ? "bg-rose-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {isMuted ? <MicOff size={13} /> : <Mic size={13} />}
        </button>
        <button
          type="button"
          onClick={onToggleCamera}
          title={isCameraOff ? "Turn camera on" : "Turn camera off"}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
            isCameraOff ? "bg-rose-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {isCameraOff ? <VideoOff size={13} /> : <Video size={13} />}
        </button>
        <button
          type="button"
          onClick={onExpand}
          title="Expand"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 cursor-pointer"
        >
          <Maximize2 size={12} />
        </button>
        <button
          type="button"
          onClick={onLeaveCall}
          title="End call"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600 cursor-pointer"
        >
          <PhoneOff size={13} />
        </button>
      </div>
    </div>
  );
};

export default FloatingCallWidget;
