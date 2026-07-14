import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, Loader2 } from "lucide-react";

import { RootState } from "../../../redux/store";
import notificationApiService from "../../../apiServices/notification/NotificationApi";
import { NotificationType } from "../../../types/notification/NotificationType";

const RecentActivities = () => {
  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id,
  );

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
    enabled: !!loginUserId,
  });

  const recentActivities = notificationData.slice(0, 5);

  return (
    <div className="bg-slate-50 rounded-xl  p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : recentActivities.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          No recent activities found.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {recentActivities.map((activity, idx) => {
            return (
              <div
                key={activity.id || idx}
                className="flex items-start gap-4 border-b border-gray-200/60 last:border-0 pb-3 last:pb-0"
              >
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1 capitalize">
                    {activity.title ||
                      activity.type?.replace(/_/g, " ") ||
                      "New Notification"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {activity.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {activity.createdAt
                      ? formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
