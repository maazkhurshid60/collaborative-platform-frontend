import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AiOutlineDelete } from "react-icons/ai";

import OutletLayout from "../../layouts/outletLayout/OutletLayout";
import usePaginationHook from "../../hook/usePaginationHook";
import CustomPagination from "../../components/customPagination/CustomPagination";
import { NotificationType } from "../../types/notification/NotificationType";
import { RootState } from "../../redux/store";
import notificationApiService from "../../apiServices/notification/NotificationApi";

import Loader from "../../components/loader/Loader";

import { getSocket } from "../../socket/Socket";
import NotificationItem from "./NotificationItem";

const NotificationPage = () => {
  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id,
  );
  const queryClient = useQueryClient();

  const { data: notificationData = [], isLoading } = useQuery<
    NotificationType[]
  >({
    queryKey: ["notifications", loginUserId],
    queryFn: async () => {
      const response =
        await notificationApiService.getAllNotification(loginUserId);

      return response?.data?.notifications?.filter(
        (data: NotificationType) =>
          data?.message !== "" && data?.recipientId === loginUserId,
      );
    },
    enabled: !!loginUserId, // important only shows when user id exist
  });

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({ data: notificationData ?? [], recordPerPage: 6 });

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>(
      "Notification" in window ? window.Notification.permission : "denied",
    );

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notifications.");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission === "granted") {
      toast.success("Desktop notifications enabled!");
    } else if (permission === "denied") {
      toast.error(
        "Notifications were denied. Please enable them in browser settings.",
      );
    }
  };

  useEffect(() => {
    if (loginUserId) {
      notificationApiService.markAsSeen(loginUserId).then(() => {
        queryClient.invalidateQueries({
          queryKey: ["unreadNotificationCount"],
        });
      });
    }
  }, [loginUserId, queryClient]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification: NotificationType) => {
      // Toast will be handled in App.tsx globally now,
      // but we keep invalidate query here for local UI update
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [queryClient]);

  return (
    <OutletLayout heading="Notifications">
      {permissionStatus !== "granted" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-full text-white">
              <AiOutlineDelete className="rotate-180" />{" "}
              {/* Just a placeholder icon */}
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">
                Stay Updated
              </h4>
              <p className="text-blue-700 text-xs">
                Enable desktop notifications to get real-time alerts for
                document shares and signings.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
          >
            Enable Notifications
          </button>
        </div>
      )}
      {isLoading ? (
        <Loader text="Loading Notifications..." />
      ) : getCurrentRecords()?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-[#2C9993]/5 p-6 rounded-full mb-6">
            <div className="bg-[#2C9993]/10 p-4 rounded-full animate-pulse">
              <Bell className="w-12 h-12 text-[#2C9993]" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#101828] mb-3 font-[Poppins]">
            No Notifications
          </h3>
          <p className="text-[#667085] max-w-sm font-medium font-[Poppins] leading-relaxed px-4">
            You’ll see notifications here for messages, shared documents, and
            collaboration activity.
          </p>
        </div>
      ) : (
        <>
          <div className="h-[65vh] overflow-y-auto px-4 ">
            {getCurrentRecords()?.map((data) => (
              <NotificationItem data={data} key={data.id} />
            ))}
          </div>
          <CustomPagination
            totalPages={totalPages}
            onPageChange={handlePageChange}
            hookCurrentPage={currentPage}
          />
        </>
      )}
    </OutletLayout>
  );
};

export default NotificationPage;
