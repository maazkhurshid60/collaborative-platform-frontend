import Button from "../../../button/Button";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import {
  isAddMembersToGroupModalReducer,
  isDeleteChannelModalShowReducer,
  isGroupSettingsModalReducer,
  isInviteToGroupModalShowReducer,
} from "../../../../redux/slices/ModalSlice";
import UserIcon from "../../../icons/user/User";
import { useState } from "react";
import {
  GroupCreatedBy,
  GroupDelete,
  GroupMember,
} from "../../../../types/chatType/GroupType";
import DeleteIcon from "../../../icons/delete/DeleteIcon";
import DeleteChannelModal from "../../../modals/providerModal/chatModal/DeleteChannelModal";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chatApiService from "../../../../apiServices/chatApi/ChatApi";
import { toast } from "react-toastify";
import messageApiService from "../../../../apiServices/chatApi/messagesApi/MessagesApi";
import { getSocket } from "../../../../socket/Socket";
import { HiMiniUserCircle } from "react-icons/hi2";
import { FiArchive, FiSettings, FiUserPlus } from "react-icons/fi";
import ToolTip from "../../../toolTip/ToolTip";

import BookProviderSessionModal from "@/components/modals/providerModal/BookProviderSessionModal";
import { startCallFromUrl } from "@/utils/callModalService";
import {
  appointmentApiService,
  AppointmentRecord,
} from "@/services/appointmentApiService";
import { Video, Calendar, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface chatNavbarProps {
  name?: string;
  groupMembers: GroupMember[];
  id: string;
  groupCreatedBy?: GroupCreatedBy;
  /** When false, only the creator can add/invite members. Defaults true. */
  membersCanInvite?: boolean;
  targetProvider?: {
    id: string;
    name: string;
    slug?: string;
  };
}

const ChatNavbar: React.FC<chatNavbarProps> = (props) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.id,
  );

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isDeleteChannelModalShow = useSelector(
    (state: RootState) => state.modalSlice.isDeleteChannelModalShow,
  );
  const deleteConservation = () => {
    dispatch(isDeleteChannelModalShowReducer(true));
  };

  const queryClient = useQueryClient();

  const { data: confirmedAppts } = useQuery<AppointmentRecord[]>({
    queryKey: ["appointments", "CONFIRMED"],
    queryFn: async () => {
      const res = await appointmentApiService.getMyAppointments("CONFIRMED");
      return res?.data ?? [];
    },
    enabled: Boolean(props.targetProvider?.id),
  });

  const activeCallAppt = (confirmedAppts ?? []).find((a) => {
    if (!props.targetProvider?.id) return false;
    return (
      a.providerId === props.targetProvider.id ||
      a.bookingProviderId === props.targetProvider.id ||
      a.provider?.id === props.targetProvider.id ||
      a.bookingProvider?.id === props.targetProvider.id
    );
  });

  const handleJoinCall = async (appointmentId: string) => {
    try {
      const res = await appointmentApiService.getCallJoinInfo(appointmentId);
      const joinUrl = res?.data?.joinUrl;
      if (joinUrl) {
        startCallFromUrl(joinUrl);
      } else {
        toast.error("Couldn't get call link.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Call is not currently active.",
      );
    }
  };

  // 1️⃣ Define the delete mutation
  const deleteSingleChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      if (!loginUserId) return;
      await messageApiService.deleteChatChannelForUser({
        channelId,
        loginUserId,
      });
      // Emit socket event to update other sessions of the same provider
      const socket = getSocket();
      socket?.emit("delete_chat_channel", {
        chatChannelId: channelId,
        providerId: loginUserId,
      });
      return channelId;
    },
    onSuccess: () => {
      toast.success("Chat Channel has been hidden for you");
      queryClient.invalidateQueries({
        queryKey: ["chatchannels"],
      });
      dispatch(isDeleteChannelModalShowReducer(false));
      navigate("/chat");
    },
    onError: (err) => {
      console.error("Delete failed", err);
      // you can show a toast here
    },
  });
  const deleteGroupChannelMutation = useMutation({
    mutationFn: async (data: GroupDelete) => {
      await chatApiService.deleteGroupChannels(data);
      return data;
    },
    onSuccess: () => {
      toast.success("Group has been deleted Successfully");

      queryClient.invalidateQueries({
        queryKey: ["groupChatchannels"],
      });
      dispatch(isDeleteChannelModalShowReducer(false));
      navigate("/chat");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(msg);
      console.error("Delete failed", err);
    },
  });

  const confirmDeleteChatChannel = () => {
    const data = { id: props.id, createdBy: loginUserId };
    if (props.groupMembers?.length > 0) deleteGroupChannelMutation.mutate(data);
    else deleteSingleChannelMutation.mutate(props.id);
  };

  const startInstantCallMutation = useMutation({
    mutationFn: async (callType: "audio" | "video") => {
      if (!props.targetProvider?.id) return;
      return appointmentApiService.startInstantCall({
        targetProviderId: props.targetProvider.id,
        callType,
      });
    },
    onSuccess: (data, callType) => {
      const joinUrl = data?.data?.callerJoinUrl;
      if (joinUrl) {
        toast.success(
          `Starting ${callType === "audio" ? "Voice" : "Video"} Call...`,
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

  return (
    <>
      {isDeleteChannelModalShow && (
        <DeleteChannelModal
          text={
            props.groupMembers?.length > 0
              ? "Deleting this conversation will remove it permanently for both users and it cannot be recovered. Are you sure you want to delete this conversation?"
              : "This will hide the conversation from your view. Messages remain visible to other participants."
          }
          heading={
            props.groupMembers?.length > 0
              ? "Deleting Group Conversation"
              : "Hiding Conversation"
          }
          onDeleteConfirm={confirmDeleteChatChannel}
        />
      )}

      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4 ">
          <p className="font-semibold text-[16px] md:text-[20px] lg:text-[24px] font-[Montserrat] inline-block  capitalize">
            {props.name}
          </p>
          {props?.groupMembers?.length > 0 && (
            <p className="text-xs bg-primaryColorDark text-white capitalize py-1 px-2 rounded-md">
              Admin:{" "}
              {loginUserId === props.groupCreatedBy?.id
                ? "You"
                : props.groupCreatedBy?.name || "Admin"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-x-4">
          <div className="w-25">
            {props?.groupMembers?.length !== undefined && (
              <div className="flex items-center relative w-full  h-8">
                {props?.groupMembers?.slice(0, 2).map((data, id: number) => (
                  <div
                    key={id}
                    className="border-solid border-textColor rounded-full border  bg-white absolute z-20"
                    style={{ right: `${id * 20}px` }}
                  >
                    {(data?.Provider?.user?.profileImage ||
                      (data as any)?.user?.profileImage) &&
                    data?.Provider?.user?.profileImage !== "null" &&
                    (data as any)?.user?.profileImage !== "null" ? (
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={
                          data?.Provider?.user?.profileImage ||
                          (data as any)?.user?.profileImage
                        }
                      />
                    ) : (
                      <UserIcon className="w-10! h-10! rounded-full object-cover text-gray-400" />
                    )}
                  </div>
                ))}
                <div
                  className="relative"
                  onMouseEnter={() => setIsShowModal(true)}
                  onMouseLeave={() => setIsShowModal(false)}
                >
                  {props?.groupMembers?.length > 0 && (
                    <div className="absolute -right-27.5 -top-2.5 z-20 flex items-center justify-center w-6 h-6 text-xs text-white bg-primaryColorDark rounded-full cursor-pointer">
                      +{props?.groupMembers?.length - 2}
                    </div>
                  )}

                  {isShowModal && (
                    <div
                      className="absolute top-full -right-25 mt-2 p-4 min-w-62.5 max-w-100 w-full max-h-75 min-h-50
               bg-white border border-gray-300 rounded-2xl z-30 flex flex-col gap-y-4 overflow-y-auto shadow-md"
                    >
                      <p className="text-sm font-semibold">
                        Other Group Members:
                      </p>
                      <hr className="h-2 text-2xl" />
                      {props?.groupMembers?.map((data) => (
                        <div className={`flex items-center gap-x-2 `}>
                          {(data?.Provider?.user?.profileImage ||
                            (data as any)?.user?.profileImage) &&
                          data?.Provider?.user?.profileImage !== "null" &&
                          (data as any)?.user?.profileImage !== "null" ? (
                            <img
                              className="w-9 h-9 rounded-full object-cover"
                              src={
                                data?.Provider?.user?.profileImage ||
                                (data as any)?.user?.profileImage
                              }
                            />
                          ) : (
                            <HiMiniUserCircle
                              size={25}
                              className="w-11! h-11! rounded-full object-cover"
                            />
                          )}
                          <div
                            className={`text-xs flex flex-col items-start gap-x-1.5 ${data?.Provider?.user?.profileImage ? "pl-3" : "pl-[-20px]"}`}
                          >
                            <p className="font-semibold capitalize">
                              {data?.Provider?.user?.fullName ||
                                (data as any)?.user?.fullName}
                            </p>
                            <p className="text-ellipsis w-2.5">
                              {(data?.Provider?.user as any)?.email ||
                                (data as any)?.user?.email ||
                                (data?.Provider as any)?.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {(loginUserId === props.groupCreatedBy?.id ||
            props.groupMembers?.length === 0) && (
            <div className="relative group flex items-center justify-center">
              {props.groupMembers?.length > 0 ? (
                <>
                  <DeleteIcon onClick={deleteConservation} />
                  <ToolTip toolTipText="Delete Group" />
                </>
              ) : (
                <>
                  <FiArchive
                    onClick={deleteConservation}
                    className="text-xl text-textGreyColor hover:text-[#2C9993] cursor-pointer"
                  />
                  <ToolTip toolTipText="Hide Conversation" />
                </>
              )}
            </div>
          )}

          {props.groupMembers?.length > 0 &&
            loginUserId === props.groupCreatedBy?.id && (
              <div className="relative group flex items-center justify-center">
                <FiSettings
                  onClick={() => dispatch(isGroupSettingsModalReducer(true))}
                  className="text-xl text-textGreyColor hover:text-[#2C9993] cursor-pointer"
                />
                <ToolTip toolTipText="Group settings" />
              </div>
            )}

          <div className="flex items-center gap-x-2">
            {props.targetProvider &&
              (!props.groupMembers || props.groupMembers.length === 0) && (
                <div className="flex items-center gap-2">
                  {activeCallAppt && (
                    <button
                      type="button"
                      onClick={() => handleJoinCall(activeCallAppt.id)}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition-all cursor-pointer animate-pulse"
                      title="Join scheduled video call room"
                    >
                      <Video size={14} /> Join Scheduled Call
                    </button>
                  )}

                  {/* Instant Voice Call */}
                  <div className="relative group flex items-center justify-center">
                    <button
                      type="button"
                      disabled={startInstantCallMutation.isPending}
                      onClick={() => startInstantCallMutation.mutate("audio")}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-2xs hover:scale-110 active:scale-95"
                    >
                      <Phone size={16} />
                    </button>
                    <ToolTip toolTipText="Voice Call" />
                  </div>

                  {/* Instant Video Call */}
                  <div className="relative group flex items-center justify-center">
                    <button
                      type="button"
                      disabled={startInstantCallMutation.isPending}
                      onClick={() => startInstantCallMutation.mutate("video")}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-primaryColorDark/30 bg-primaryColorLight/20 text-primaryColorDark hover:bg-primaryColorDark hover:text-white transition-all duration-200 cursor-pointer shadow-2xs hover:scale-110 active:scale-95"
                    >
                      <Video size={16} />
                    </button>
                    <ToolTip toolTipText="Video Call" />
                  </div>

                  {/* Schedule Call */}
                  <div className="relative group flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(true)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-primaryColorDark/50 hover:bg-primaryColorLight/20 hover:text-primaryColorDark transition-all duration-200 cursor-pointer shadow-2xs hover:scale-110 active:scale-95"
                    >
                      <Calendar size={16} />
                    </button>
                    <ToolTip toolTipText="Schedule Call" />
                  </div>
                </div>
              )}

            {(() => {
              const isCreator = loginUserId === props.groupCreatedBy?.id;
              const canInvite = props.membersCanInvite !== false || isCreator;
              const showInviteButtons =
                props.groupMembers?.length > 0 && canInvite;
              return showInviteButtons ? (
                <>
                  <div className="w-20 md:w-25 lg:w-32.5">
                    <Button
                      text="Add Member"
                      icon={<FiUserPlus />}
                      sm
                      onclick={() => {
                        dispatch(isAddMembersToGroupModalReducer(true));
                      }}
                    />
                  </div>

                  {/* Existing Invite-via-email button for Group Chats */}
                  <div className="w-15 md:w-17.5 lg:w-25">
                    <Button
                      text="Invite"
                      icon={<HiMiniUserCircle />}
                      sm
                      onclick={() => {
                        dispatch(isInviteToGroupModalShowReducer(true));
                      }}
                    />
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      {props.targetProvider && isBookingModalOpen && (
        <BookProviderSessionModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          targetProvider={props.targetProvider}
        />
      )}
    </>
  );
};

export default ChatNavbar;
