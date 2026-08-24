import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  Phone,
  Video,
  PhoneMissed,
  PhoneCall,
  Clock,
  Search,
  PhoneOutgoing,
  PhoneIncoming,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import OutletLayout from "@/layouts/outletLayout/OutletLayout";
import { appointmentApiService } from "@/services/appointmentApiService";
import { startCallFromUrl } from "@/utils/callModalService";
import Loader from "@/components/loader/Loader";
import { RootState } from "@/redux/store";

const CallLogsPage = () => {
  const [filterType, setFilterType] = useState<
    "ALL" | "MISSED" | "COMPLETED" | "AUDIO" | "VIDEO"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const userDetails = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const loginUserId = userDetails?.userId || userDetails?.id;
  const loginProviderId = userDetails?.id;

  const { data: callSessions = [], isLoading } = useQuery({
    queryKey: ["allMyCallLogs"],
    queryFn: async () => {
      const res = await appointmentApiService.getAllMyCallLogs();
      return res?.data ?? [];
    },
  });

  const startInstantCallMutation = useMutation({
    mutationFn: async ({
      targetProviderId,
      callType,
    }: {
      targetProviderId: string;
      callType: "audio" | "video";
    }) => {
      return appointmentApiService.startInstantCall({
        targetProviderId,
        callType,
      });
    },
    onSuccess: (data, variables) => {
      const joinUrl = data?.data?.callerJoinUrl;
      if (joinUrl) {
        toast.success(
          `Starting ${variables.callType === "audio" ? "Voice" : "Video"} Call...`,
        );
        startCallFromUrl(joinUrl);
      } else {
        toast.error("Failed to start call.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Could not start call.");
    },
  });

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Filter call logs
  const filteredCalls = callSessions.filter((appt: any) => {
    const logs = appt.callLogs || [];
    const completedLog = logs.find((l: any) => l.event === "completed");
    const missedLog = logs.find((l: any) => l.event === "missed");
    const isCompleted = Boolean(completedLog);
    const isMissed =
      Boolean(missedLog) ||
      (!isCompleted && new Date(appt.createdAt).getTime() < Date.now() - 40000);
    const isAudio = appt.notes?.toLowerCase().includes("voice");
    const isVideo = appt.notes?.toLowerCase().includes("video") || !isAudio;

    if (filterType === "MISSED" && !isMissed) return false;
    if (filterType === "COMPLETED" && !isCompleted) return false;
    if (filterType === "AUDIO" && !isAudio) return false;
    if (filterType === "VIDEO" && !isVideo) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const hostName = appt.provider?.user?.fullName?.toLowerCase() || "";
      const bookerName =
        appt.bookingProvider?.user?.fullName?.toLowerCase() ||
        appt.guestName?.toLowerCase() ||
        "";
      const hostEmail = appt.provider?.user?.email?.toLowerCase() || "";
      const bookerEmail =
        appt.bookingProvider?.user?.email?.toLowerCase() ||
        appt.guestEmail?.toLowerCase() ||
        "";

      return (
        hostName.includes(query) ||
        bookerName.includes(query) ||
        hostEmail.includes(query) ||
        bookerEmail.includes(query)
      );
    }

    return true;
  });

  const totalMissedCount = callSessions.filter((a: any) => {
    const logs = a.callLogs || [];
    const completedLog = logs.find((l: any) => l.event === "completed");
    return (
      Boolean(logs.find((l: any) => l.event === "missed")) ||
      (!completedLog && new Date(a.createdAt).getTime() < Date.now() - 40000)
    );
  }).length;

  return (
    <OutletLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
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
              <p className="text-lg font-bold text-gray-900">
                {callSessions.length}
              </p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-2 text-center shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                Missed Calls
              </p>
              <p className="text-lg font-bold text-red-600">
                {totalMissedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { label: "All Calls", value: "ALL" },
                { label: "Missed", value: "MISSED" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Voice Calls", value: "AUDIO" },
                { label: "Video Calls", value: "VIDEO" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setFilterType(filter.value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === filter.value
                    ? "bg-primaryColorDark text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search caller name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-primaryColorDark focus:outline-none"
            />
          </div>
        </div>

        {/* Call Logs Table / List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader />
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-base font-semibold text-gray-700">
                No call history found
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No calls match your search query."
                  : "Calls initiated or received through chat will be logged here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCalls.map((appt: any) => {
                const logs = appt.callLogs || [];
                const completedLog = logs.find(
                  (l: any) => l.event === "completed",
                );
                const missedLog = logs.find((l: any) => l.event === "missed");
                const isCompleted = Boolean(completedLog);
                const isMissed =
                  Boolean(missedLog) ||
                  (!isCompleted &&
                    new Date(appt.createdAt).getTime() < Date.now() - 40000);
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
                const otherEmail =
                  otherParty?.user?.email || appt.guestEmail || "";
                const otherAvatar = otherParty?.user?.profileImage;
                const targetProviderId = isCaller
                  ? appt.provider?.id
                  : appt.bookingProvider?.id || appt.providerId;

                return (
                  <div
                    key={appt.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
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
                            isMissed
                              ? "bg-red-500 text-white"
                              : "bg-emerald-500 text-white"
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

                        <p className="text-xs text-gray-500 mt-0.5">
                          {otherEmail}
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            {isAudio ? (
                              <Phone size={12} />
                            ) : (
                              <Video size={12} />
                            )}
                            {isAudio ? "Voice Call" : "Video Call"}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(appt.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {completedLog?.durationSeconds && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600">
                                Duration:{" "}
                                {formatDuration(completedLog.durationSeconds)}
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
                            disabled={startInstantCallMutation.isPending}
                            onClick={() =>
                              startInstantCallMutation.mutate({
                                targetProviderId,
                                callType: "audio",
                              })
                            }
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                          >
                            <Phone size={13} /> Call Back (Voice)
                          </button>
                          <button
                            type="button"
                            disabled={startInstantCallMutation.isPending}
                            onClick={() =>
                              startInstantCallMutation.mutate({
                                targetProviderId,
                                callType: "video",
                              })
                            }
                            className="flex items-center gap-1.5 rounded-xl border border-primaryColorDark/30 bg-primaryColorLight/30 px-3 py-1.5 text-xs font-bold text-primaryColorDark hover:bg-primaryColorDark hover:text-white transition-all cursor-pointer"
                          >
                            <Video size={13} /> Call Back (Video)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </OutletLayout>
  );
};

export default CallLogsPage;
