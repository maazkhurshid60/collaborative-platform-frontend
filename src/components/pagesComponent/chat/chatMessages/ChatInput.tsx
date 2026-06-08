import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IoAttachSharp } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

import { RootState } from "../../../../redux/store";
import messageApiService from "../../../../apiServices/chatApi/messagesApi/MessagesApi";
import { getSocket } from "../../../../socket/Socket";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import { GroupChat } from "../../../../types/chatType/GroupType";
import { Message } from "./ChatMessages";
import PhiAttestationModal from "../../../modals/PhiAttestationModal/PhiAttestationModal";
import CrossIcon from "../../../icons/cross/Cross";

interface ChatInputProps {
  activeChatObject: ChatChannelType | GroupChat;
  activeChatType?: "individual" | "group";
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  activeChatObject,
  activeChatType,
  setMessages,
  messagesEndRef,
}) => {
  const [sendMessageText, setSendMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPhiModal, setShowPhiModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loginUserUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.userId,
  );
  const loginUserProfileImage = useSelector(
    (state: RootState) =>
      state?.LoginUserDetail?.userDetails?.user.profileImage,
  );
  const blockedMembers = useSelector(
    (state: RootState) =>
      state?.LoginUserDetail?.userDetails?.user?.blockedMembers,
  );
  const userRole = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.role,
  );
  const clientList = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.clientList,
  );

  const queryClient = useQueryClient();
  const socket = getSocket();

  const sendMessage = async (phiData?: {
    isPhi: boolean;
    phiClientId?: string;
  }) => {
    if (
      (!sendMessageText.trim() && selectedFiles.length === 0) ||
      !activeChatObject
    )
      return;

    const normalizedRole = String(userRole || "").toLowerCase();
    const sessionPhiKey = `phi_attested_${loginUserUserId}_${activeChatObject.id}`;
    let currentPhiData = phiData;

    if (normalizedRole === "provider" && !currentPhiData) {
      const storedPhi = sessionStorage.getItem(sessionPhiKey);
      if (storedPhi) {
        currentPhiData = JSON.parse(storedPhi);
      } else {
        setShowPhiModal(true);
        return;
      }
    }

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      senderId: loginUserUserId,
      message: sendMessageText || selectedFiles.map((f) => f.name).join(", "),
      chatChannelId: activeChatObject.id,
      createdAt: new Date().toISOString(),
      sender: { fullName: "You", profileImage: loginUserProfileImage },
      you: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setSendMessageText("");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const formData = new FormData();
      formData.append("senderId", loginUserUserId);
      formData.append("type", selectedFiles.length ? "media" : "text");

      if (activeChatType === "individual") {
        formData.append("chatChannelId", activeChatObject.id);
      } else {
        formData.append("groupId", activeChatObject.id);
      }

      if (currentPhiData) {
        formData.append("isPhi", String(currentPhiData.isPhi));
        if (currentPhiData.phiClientId) {
          formData.append("phiClientId", currentPhiData.phiClientId);
        }
      }

      if (sendMessageText.trim()) {
        formData.append("message", sendMessageText);
      }

      selectedFiles.forEach((file) => {
        formData.append("mediaUrl", file);
      });

      setSelectedFiles([]);

      let saved: any;

      if (activeChatType === "individual") {
        const res =
          await messageApiService.sendMessageToSingleConservation(formData);

        saved = res?.data?.chatMessage;

        const otherId =
          (activeChatObject as ChatChannelType).providerA.id === loginUserUserId
            ? (activeChatObject as ChatChannelType).providerB.id
            : (activeChatObject as ChatChannelType).providerA.id;

        socket?.emit("send_direct", { toProviderId: otherId, message: saved });
      } else {
        const res =
          await messageApiService.sendMessagesOfGroupChatChannel(formData);
        saved = res.data.chatMessage;

        socket?.emit("send_group", { message: saved });
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...saved, you: true, status: "sent" } : m,
        ),
      );

      queryClient.setQueryData<ChatChannelType[]>(
        ["chatchannels"],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((channel) =>
            channel.id === activeChatObject.id
              ? {
                  ...channel,
                  lastMessage: {
                    id: saved.id,
                    message: saved.message || "New message",
                    createdAt: saved.createdAt,
                  },
                  totalUnread: 0,
                  updatedAt: new Date().toISOString(),
                }
              : channel,
          );
        },
      );
      queryClient.setQueryData<GroupChat[]>(
        ["groupChatchannels"],
        (oldGroups = []) =>
          oldGroups.map((group) => {
            if (group.id === saved.groupId) {
              return {
                ...group,
                lastMessage: {
                  id: saved.id,
                  message: saved.message || saved.mediaUrl || "📎 File",
                  createdAt: saved.createdAt || new Date().toISOString(),
                },
                unreadCount:
                  saved.senderId === loginUserUserId
                    ? group.unreadCount
                    : (Number(group.unreadCount) || 0) + 1,
                updatedAt: new Date().toISOString(),
              };
            }
            return { ...group };
          }),
      );
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const otherUserId =
    (activeChatObject as ChatChannelType)?.providerA?.id === loginUserUserId
      ? (activeChatObject as ChatChannelType)?.providerB?.id
      : (activeChatObject as ChatChannelType)?.providerA?.id;

  const isBlocked =
    activeChatType === "individual" && blockedMembers?.includes(otherUserId);

  return (
    <div className="mt-auto">
      {showPhiModal && (
        <PhiAttestationModal
          onClose={() => setShowPhiModal(false)}
          isMedia={selectedFiles.length > 0}
          clients={(clientList || []).map((item: any) => ({
            id: item?.client?.id || item?.clientId,
            user: {
              fullName: item?.client?.user?.fullName || "Unknown Client",
            },
          }))}
          onConfirm={(data) => {
            setShowPhiModal(false);
            sessionStorage.setItem(
              `phi_attested_${loginUserUserId}_${activeChatObject.id}`,
              JSON.stringify(data),
            );
            sendMessage(data);
          }}
        />
      )}

      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {selectedFiles.map((file, index) => {
            const extension = file.name.split(".").pop()?.toLowerCase();
            const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
              extension || "",
            );
            const isPdf = extension === "pdf";
            const isDoc = ["doc", "docx"].includes(extension || "");

            const fileIcon = isImage
              ? "🖼️"
              : isPdf
                ? "📄"
                : isDoc
                  ? "📝"
                  : "📎";

            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm relative max-w-55"
              >
                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-100 italic">
                  {isImage ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onLoad={(e) =>
                        URL.revokeObjectURL((e.target as HTMLImageElement).src)
                      }
                    />
                  ) : (
                    <div className="text-lg">{fileIcon}</div>
                  )}
                </div>
                <span className="text-sm truncate max-w-30 text-gray-700">
                  {file.name}
                </span>

                <CrossIcon
                  onClick={() => {
                    setSelectedFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {isBlocked ? (
        <div className="flex items-center justify-center ">
          <div className="text-center">
            <span className="text-red-500 mb-2">
              You have blocked this user please unblock in{" "}
              <Link to="/setting" className="text-blue-500 text-sm underline">
                Settings
              </Link>{" "}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <textarea
            className="outline-none pl-4 p-2 w-full bg-gray-100 rounded-lg resize-none overflow-hidden"
            placeholder="Type your message..."
            value={sendMessageText}
            onChange={(e) => {
              setSendMessageText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={1}
          />
          <div className="flex items-center gap-x-4 p-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
                }
              }}
            />

            <IoAttachSharp
              size={30}
              className="rotate-45 cursor-pointer text-textGreyColor"
              onClick={() => fileInputRef.current?.click()}
            />
            <button
              className="h-9.5 w-9.5 bg-primaryColorDark rounded-full flex items-center justify-center text-white"
              onClick={() => sendMessage()}
            >
              <IoIosSend size={24} className="cursor-pointer" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
