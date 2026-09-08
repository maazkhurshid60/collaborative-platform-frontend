import React from "react";
import { PhoneCall } from "lucide-react";

interface CallLogsHeaderProps {
  totalCalls: number;
  missedCalls: number;
}

export const CallLogsHeader: React.FC<CallLogsHeaderProps> = ({
  totalCalls,
  missedCalls,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primaryColorLight/40 text-primaryColorDark">
            <PhoneCall size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-[Montserrat]">
              Call History & Logs
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              View and manage all your direct voice and video calls
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-center shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Total Calls
          </p>
          <p className="text-lg font-bold text-gray-900">{totalCalls}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-2 text-center shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            Missed Calls
          </p>
          <p className="text-lg font-bold text-red-600">{missedCalls}</p>
        </div>
      </div>
    </div>
  );
};
