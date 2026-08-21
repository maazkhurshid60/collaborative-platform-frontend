import React from "react";
import { VideoOff, UserCheck, PhoneCall } from "lucide-react";
import { PendingGuest, CallStage } from "../CallRoomPage";

interface CallRoomVideoGridProps {
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOff: boolean;
  participantName: string;
  stage: CallStage;
  audioOnly?: boolean;
  callDurationSeconds?: number;
  pendingGuest: PendingGuest | null;
  onApproveGuest: (socketId: string, approved: boolean) => void;
}

export const CallRoomVideoGrid: React.FC<CallRoomVideoGridProps> = ({
  remoteVideoRef,
  localVideoRef,
  isCameraOff,
  participantName,
  stage,
  audioOnly = false,
  callDurationSeconds = 0,
  pendingGuest,
  onApproveGuest,
}) => {
  const isConnectingOrRinging =
    stage !== "connected" && stage !== "ended" && stage !== "error";

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Dedicated Voice Call UI
  if (audioOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl bg-gray-950 min-h-75 text-center relative overflow-hidden">
        {/* Hidden video elements for WebRTC audio playback */}
        <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
        />

        {/* Admission Banner */}
        {pendingGuest && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 z-10">
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>{pendingGuest.guestName} wants to join the call</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApproveGuest(pendingGuest.socketId, false)}
                className="rounded-full border border-rose-400 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                Deny
              </button>
              <button
                type="button"
                onClick={() => onApproveGuest(pendingGuest.socketId, true)}
                className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer"
              >
                Admit
              </button>
            </div>
          </div>
        )}

        {/* Glowing Profile Avatar Ring */}
        <div className="relative flex items-center justify-center my-4">
          {isConnectingOrRinging && (
            <>
              <span className="animate-ping absolute inline-flex h-28 w-28 rounded-full bg-emerald-500/30 opacity-75" />
              <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-emerald-500/50 opacity-90" />
            </>
          )}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl ring-4 ring-emerald-500/30">
            <PhoneCall
              size={34}
              className={isConnectingOrRinging ? "animate-bounce-short" : ""}
            />
          </div>
        </div>

        {/* Participant Name & Live Status */}
        <h3 className="text-xl font-bold text-white mt-2">{participantName}</h3>
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 mt-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          {stage === "connected"
            ? `Connected • ${formatTimer(callDurationSeconds)}`
            : stage === "connecting"
              ? "Calling..."
              : "Ringing..."}
        </p>
      </div>
    );
  }

  // Video Call Split Grid UI
  return (
    <div>
      {/* Admission Banner */}
      {pendingGuest && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <div className="flex items-center gap-2">
            <UserCheck size={16} />
            <span>{pendingGuest.guestName} wants to join the call</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onApproveGuest(pendingGuest.socketId, false)}
              className="rounded-full border border-rose-400 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              Deny
            </button>
            <button
              type="button"
              onClick={() => onApproveGuest(pendingGuest.socketId, true)}
              className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer"
            >
              Admit
            </button>
          </div>
        </div>
      )}

      {/* Video Stage: the other participant fills the frame; "You" is a
          small, distinctly-bordered thumbnail overlay — the same
          picture-in-picture convention used by Zoom/Meet/WhatsApp, so who's
          who is obvious from layout alone, not just a text label. */}
      <div className="relative rounded-2xl bg-gray-950 p-3 min-h-90">
        <div className="relative flex min-h-90 items-center justify-center rounded-xl bg-gray-900 overflow-hidden">
          {/* Remote Video Stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover ${isConnectingOrRinging ? "hidden" : "block"}`}
          />

          {/* Outgoing Ringing Overlay */}
          {isConnectingOrRinging && (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-500/40 opacity-75" />
                <span className="animate-pulse absolute inline-flex h-16 w-16 rounded-full bg-emerald-500/60 opacity-90" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <PhoneCall size={26} className="animate-bounce-short" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {participantName}
                </h4>
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 mt-1">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {stage === "ringing" ? "Ringing..." : "Calling..."}
                </p>
              </div>
            </div>
          )}

          {/* Participant Label & Duration Timer */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
              {participantName}
            </span>
            {stage === "connected" && (
              <span className="rounded-md bg-emerald-500/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                {formatTimer(callDurationSeconds)}
              </span>
            )}
          </div>

          {/* Local "You" Thumbnail (picture-in-picture) */}
          <div className="absolute bottom-3 right-3 z-20 h-24 w-32 sm:h-28 sm:w-40 overflow-hidden rounded-xl border-2 border-primaryColorDark bg-gray-800 shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${isCameraOff ? "hidden" : "block"}`}
            />
            {isCameraOff && (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gray-800 text-gray-300">
                <VideoOff size={18} />
              </div>
            )}
            <span className="absolute bottom-1 left-1 rounded-md bg-primaryColorDark/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              You
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallRoomVideoGrid;
