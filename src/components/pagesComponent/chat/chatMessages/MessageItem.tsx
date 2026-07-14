import React from "react";
import UserIcon from "../../../icons/user/User";
import DeleteIcon from "../../../icons/delete/DeleteIcon";
import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { Message } from "./ChatMessages";
import messageApiService from "../../../../apiServices/chatApi/messagesApi/MessagesApi";

interface MessageItemProps {
  msg: Message;
  markMessagesAsRead: () => void;
  loginUserProfileImage?: string | null;
  channelId?: string;
  loginUserProviderId?: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  socket: any;
}

const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  markMessagesAsRead,
  loginUserProfileImage,
  channelId,
  loginUserProviderId,
  setMessages,
  socket,
}) => {
  const mediaFiles = msg.mediaUrl ? msg.mediaUrl.split(",") : [];

  const handleDeleteMessage = async (messageId: string) => {
    if (!channelId || !loginUserProviderId) return;
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      await messageApiService.deleteMessageSingleConservation({
        channelId: channelId,
        messageId,
        loginUserId: loginUserProviderId,
      });

      // Optimistically update
      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      // Notify via socket
      socket?.emit("delete_direct_message", {
        chatChannelId: channelId,
        messageId,
      });
    } catch (error) {
      console.error("❌ Failed to delete message:", error);
    }
  };

  return (
    <div
      className={`flex items-start mb-6 ${msg.you ? "justify-end" : ""} gap-x-4 group`}
    >
      {!msg.you && (
        <div
          className="relative cursor-pointer"
          onClick={() => markMessagesAsRead()}
        >
          {msg?.sender?.profileImage !== null &&
          msg?.sender?.profileImage !== "null" ? (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={msg?.sender?.profileImage}
            />
          ) : (
            <UserIcon size={30} />
          )}
          {/* <UnreadBadge count={unreadCounts[msg.senderId] || 0} /> */}
        </div>
      )}

      {/* Message content */}
      <div
        className={`max-w-[75%] flex flex-col ${msg.you ? "items-end" : ""}`}
      >
        <p className="font-semibold mb-2 capitalize">
          {msg?.you ? "You" : msg?.sender?.fullName}
        </p>

        <div className="flex items-center gap-x-4 text-[14px]">
          {msg?.you && (
            <div className="flex items-center gap-x-2">
              <p className="text-textGreyColor text-[12px]">
                {new Date(msg.createdAt)
                  .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .toLowerCase()}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 relative">
            {/* Media Files */}
            <div className="flex flex-col gap-2 mt-1">
              {mediaFiles.map((url, index) => {
                const extension = url.split(".").pop()?.toLowerCase();
                const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                  extension || "",
                );
                const isPdf = extension === "pdf";
                const isDoc = ["doc", "docx"].includes(extension || "");

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                  >
                    {isImage ? (
                      <img
                        src={url}
                        alt="media"
                        className="w-32 h-auto rounded-md object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xl">
                        {isPdf ? "📄" : isDoc ? "📝" : "📎"}
                      </div>
                    )}

                    <div className="flex flex-col justify-center">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium hover:underline text-sm"
                      >
                        {isImage
                          ? "View Image"
                          : isPdf
                            ? "View PDF"
                            : isDoc
                              ? "Open Document"
                              : "Download File"}
                      </a>
                      <p className="text-xs text-gray-400 mt-1">
                        .{extension?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decrypted Text Message */}
            {msg.message && (
              <div
                className={`relative flex items-center gap-x-2 ${msg.you ? "flex-row-reverse" : ""}`}
              >
                <p
                  className={`relative p-2 rounded-lg max-w-xs wrap-break-word ${msg.you ? "bg-primaryColorDark text-white bubble-right" : "bg-[#EAF5F4] text-textGreyColor bubble-left"}`}
                >
                  {msg.message}
                </p>
                {msg.you && (
                  <DeleteIcon
                    className="w-4 h-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMessage(msg.id)}
                  />
                )}
              </div>
            )}
            <div className="absolute bottom-0.5 right-0.5">
              {msg.you && msg.status === "sent" && (
                <FaCircleCheck className="text-white" size={12} />
              )}
              {msg.you && msg.status === "sending" && (
                <FaRegCircle className="text-white" size={12} />
              )}
            </div>
          </div>

          {!msg?.you && (
            <p className="text-textGreyColor text-[12px]">
              {new Date(msg.createdAt)
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .toLowerCase()}
            </p>
          )}
        </div>
      </div>

      {msg.you && (
        <>
          {loginUserProfileImage !== null &&
          loginUserProfileImage !== "null" ? (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={loginUserProfileImage}
            />
          ) : (
            <UserIcon size={30} />
          )}
        </>
      )}
    </div>
  );
};

export default MessageItem;
