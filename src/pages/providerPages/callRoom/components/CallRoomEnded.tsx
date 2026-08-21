import React from "react";
import { PhoneOff } from "lucide-react";

interface CallRoomEndedProps {
  stageMessage: string | null;
  onReturn: () => void;
}

export const CallRoomEnded: React.FC<CallRoomEndedProps> = ({
  stageMessage,
  onReturn,
}) => {
  return (
    <div className="py-12 text-center">
      <PhoneOff size={40} className="mx-auto text-gray-400" />
      <h3 className="mt-3 text-lg font-bold text-textColor dark:text-white">
        Call Ended
      </h3>
      <p className="mt-1 text-xs text-textGreyColor">
        {stageMessage || "The call session has ended."}
      </p>
      <button
        type="button"
        onClick={onReturn}
        className="mt-4 rounded-full bg-primaryColorDark px-5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default CallRoomEnded;
