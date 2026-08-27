import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Clock } from "lucide-react";
import { toast } from "react-toastify";
import OutletLayout from "@/layouts/outletLayout/OutletLayout";
import { appointmentApiService } from "@/services/appointmentApiService";
import { startCallFromUrl } from "@/utils/callModalService";
import Loader from "@/components/loader/Loader";
import { RootState } from "@/redux/store";

import { CallLogsHeader } from "@/components/pagesComponent/callLogs/CallLogsHeader";
import {
  CallLogsFilterBar,
  type FilterType,
} from "@/components/pagesComponent/callLogs/CallLogsFilterBar";
import { CallLogsSelectionBar } from "@/components/pagesComponent/callLogs/CallLogsSelectionBar";
import { CallLogItem } from "@/components/pagesComponent/callLogs/CallLogItem";
import { ClearAllModal } from "@/components/pagesComponent/callLogs/ClearAllModal";

const CallLogsPage = () => {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);

  const userDetails = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const loginUserId = userDetails?.userId || userDetails?.id;
  const loginProviderId = userDetails?.id;

  // Fetch Call Logs
  const { data: callSessions = [], isLoading } = useQuery({
    queryKey: ["allMyCallLogs"],
    queryFn: async () => {
      const res = await appointmentApiService.getAllMyCallLogs();
      return res?.data ?? [];
    },
  });

  // Single Delete Mutation
  const deleteSingleMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      setDeletingId(appointmentId);
      return appointmentApiService.deleteSingleCallLog(appointmentId);
    },
    onSuccess: (_, appointmentId) => {
      toast.success("Call log deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["allMyCallLogs"] });
      setSelectedIds((prev) => prev.filter((id) => id !== appointmentId));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete call log.");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return appointmentApiService.bulkDeleteCallLogs(ids);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Selected call logs deleted.");
      queryClient.invalidateQueries({ queryKey: ["allMyCallLogs"] });
      setSelectedIds([]);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete call logs.");
    },
  });

  // Clear All Mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      return appointmentApiService.clearAllCallLogs();
    },
    onSuccess: (data) => {
      toast.success(data?.message || "All call logs cleared.");
      queryClient.invalidateQueries({ queryKey: ["allMyCallLogs"] });
      setSelectedIds([]);
      setConfirmClearAllOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to clear call logs.");
    },
  });

  // Instant Call Mutation
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

  // Memoized count of missed calls
  const totalMissedCount = useMemo(() => {
    return callSessions.filter((a: any) => {
      const logs = a.callLogs || [];
      const completedLog = logs.find((l: any) => l.event === "completed");
      return (
        Boolean(logs.find((l: any) => l.event === "missed")) ||
        (!completedLog && new Date(a.createdAt).getTime() < Date.now() - 40000)
      );
    }).length;
  }, [callSessions]);

  // Memoized Filtered Calls
  const filteredCalls = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return callSessions.filter((appt: any) => {
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

      if (query) {
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
  }, [callSessions, filterType, searchQuery]);

  const isAllSelected =
    filteredCalls.length > 0 &&
    filteredCalls.every((appt: any) => selectedIds.includes(appt.id));

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCalls.map((appt: any) => appt.id));
    }
  }, [isAllSelected, filteredCalls]);

  const handleToggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleDeleteSingle = useCallback(
    (id: string) => {
      deleteSingleMutation.mutate(id);
    },
    [deleteSingleMutation],
  );

  const handleStartCall = useCallback(
    (params: { targetProviderId: string; callType: "audio" | "video" }) => {
      startInstantCallMutation.mutate(params);
    },
    [startInstantCallMutation],
  );

  return (
    <OutletLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <CallLogsHeader
          totalCalls={callSessions.length}
          missedCalls={totalMissedCount}
        />

        {/* Filter Controls & Search Bar */}
        <CallLogsFilterBar
          filterType={filterType}
          onFilterChange={setFilterType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          hasCallSessions={callSessions.length > 0}
          onOpenClearAll={() => setConfirmClearAllOpen(true)}
          isClearingAll={clearAllMutation.isPending}
        />

        {/* Selection / Bulk Actions Toolbar */}
        <CallLogsSelectionBar
          isAllSelected={isAllSelected}
          totalFilteredCount={filteredCalls.length}
          selectedCount={selectedIds.length}
          onToggleSelectAll={handleToggleSelectAll}
          onBulkDelete={() => bulkDeleteMutation.mutate(selectedIds)}
          isBulkDeleting={bulkDeleteMutation.isPending}
        />

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
              {filteredCalls.map((appt: any) => (
                <CallLogItem
                  key={appt.id}
                  appt={appt}
                  loginUserId={loginUserId}
                  loginProviderId={loginProviderId}
                  isSelected={selectedIds.includes(appt.id)}
                  onToggleSelect={handleToggleSelectOne}
                  onDeleteSingle={handleDeleteSingle}
                  onStartCall={handleStartCall}
                  isDeleting={deletingId === appt.id}
                  isCalling={startInstantCallMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Clear All Confirmation Modal */}
        <ClearAllModal
          isOpen={confirmClearAllOpen}
          onClose={() => setConfirmClearAllOpen(false)}
          onConfirm={() => clearAllMutation.mutate()}
          isLoading={clearAllMutation.isPending}
        />
      </div>
    </OutletLayout>
  );
};

export default CallLogsPage;
