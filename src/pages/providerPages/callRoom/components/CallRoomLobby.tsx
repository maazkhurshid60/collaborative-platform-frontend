import React from "react";
import { Video, Loader2 } from "lucide-react";
import { CallInfo } from "../CallRoomPage";

interface CallRoomLobbyProps {
  callInfo: CallInfo | null;
  audioOnlyParam: boolean;
  isJoining: boolean;
  onJoinCall: () => void;
}

export const CallRoomLobby: React.FC<CallRoomLobbyProps> = ({
  callInfo,
  audioOnlyParam,
  isJoining,
  onJoinCall,
}) => {
  const participantName = callInfo
    ? callInfo.role === "guest"
      ? callInfo.providerName || "Provider"
      : callInfo.guestName || "Guest"
    : "Provider";

  return (
    <div className="py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primaryColorLight/20 text-primaryColorDark">
        <Video size={32} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-textColor dark:text-white">
        Ready to join {audioOnlyParam ? "Voice" : "Video"} Call?
      </h2>
      <p className="mt-1 text-xs text-textGreyColor">
        Session with{" "}
        <span className="font-semibold text-textColor dark:text-white">
          {participantName}
        </span>
      </p>
      <button
        type="button"
        onClick={onJoinCall}
        disabled={isJoining}
        className="mt-6 flex w-full max-w-xs mx-auto items-center justify-center gap-2 rounded-full bg-primaryColorDark py-3 text-sm font-semibold text-white shadow-md hover:bg-primaryColorDark/90 transition-all cursor-pointer"
      >
        {isJoining ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Connecting...
          </>
        ) : (
          `Join Call Now`
        )}
      </button>
    </div>
  );
};

export default CallRoomLobby;
