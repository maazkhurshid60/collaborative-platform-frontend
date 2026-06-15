import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Dot } from "lucide-react";

import notificationApiService from "@/apiServices/notification/NotificationApi";
import UserIcon from "@/components/icons/user/User";
import { isModalDeleteReducer } from "@/redux/slices/ModalSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { NotificationType } from "@/types/notification/NotificationType";
import Loader from "@/components/loader/Loader";
import DeleteClientModal from "@/components/modals/providerModal/deleteClientModal/DeleteClientModal";

interface NotificationItemProp {
  data: NotificationType;
}

const NotificationItem = ({ data }: NotificationItemProp) => {
  const queryClient = useQueryClient();
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<string>("");
  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id,
  );

  const isModalDelete = useSelector(
    (state: RootState) => state?.modalSlice.isModalDelete,
  );

  const dispatch = useDispatch<AppDispatch>();
  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const dataSendToBackend = { notificationId: id, userId: loginUserId };
      await notificationApiService.deleteNotification(dataSendToBackend);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification has been deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete the notification!");
    },
  });
  const handleDeleteFun = (id: string) => {
    dispatch(isModalDeleteReducer(true));
    setSelectedNotificationId(id);
  };
  const handleDeleteConfirm = () => {
    mutate(selectedNotificationId);

    dispatch(isModalDeleteReducer(false));
  };
  return (
    <>
      {isPending && <Loader text="Deleting..." />}
      {isModalDelete && selectedNotificationId && (
        <DeleteClientModal
          onDeleteConfirm={handleDeleteConfirm}
          text={
            <span>
              By deleting this notification, you won’t be able to view it again.
              Are you sure you want to delete it?
            </span>
          }
        />
      )}
      <div className="flex items-center justify-between font-[Poppins] mb-4 mt-4 text-textGreyColor border-b border-b-solid border-b-textGreyColor pb-4">
        <div className="flex items-start gap-x-4">
          {
            <UserIcon
              size={80}
              profileImg={
                data?.sender?.id !== loginUserId
                  ? data?.sender?.profileImage
                  : data?.recipient?.profileImage
              }
            />
          }

          <div className="w-full sm:w-[80%] md:w-[70%] lg:w-full ">
            <div className="flex items-center justify-between gap-x-5">
              <div className="flex items-center gap-x-4">
                <p className="font-semibold text-[14px] md:text-[16px] lg:text-[18px] text-textColor capitalize flex items-center gap-2">
                  {data?.sender?.id === loginUserId
                    ? "you"
                    : data?.sender?.fullName}
                  {data?.type && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wide">
                      {data.type.replace(/_/g, " ")}
                    </span>
                  )}
                </p>
                <div className="flex items-center  ">
                  <Dot />
                  <p className="font-light text-[10px] lg:text-[12px] ">
                    {" "}
                    {formatDistanceToNow(new Date(data?.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <AiOutlineDelete
                className="text-redColor cursor-pointer block sm:hidden"
                size={18}
                onClick={() => handleDeleteFun(data?.id)}
              />
            </div>
            {data?.title && (
              <p className="font-semibold text-[13px] md:text-[15px] text-[#2C9993] mt-1 mb-0.5">
                {data.title}
              </p>
            )}
            <p className="text-[12px] lg:text-[14px]">{data?.message}</p>
          </div>
        </div>
        <AiOutlineDelete
          className="text-redColor cursor-pointer hidden sm:block sm:text-[26px] md:text-[30px] lg:text-[20px]"
          onClick={() => handleDeleteFun(data?.id)}
        />
      </div>
    </>
  );
};

export default NotificationItem;
