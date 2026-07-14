import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "../../../../redux/store";
import messageApiService from "../../../../apiServices/chatApi/messagesApi/MessagesApi";
import { getSocket } from "../../../../socket/Socket";
import ChatNavbar from "./ChatNavbar";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import {
  GroupChat,
  GroupCreatedBy,
  GroupMember,
} from "../../../../types/chatType/GroupType";
import "./chat.css";
import { useQueryClient } from "@tanstack/react-query";
import { NewMessage } from "../../../../types/chatType/ChatType";
import SpinnerLoader from "../../../loader/SpinnerLoader";

import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";

export interface Message {
  id: string;
  senderId: string;
  groupId?: string | null;
  message: string;
  chatChannelId: string;
  mediaUrl?: string;
  createdAt: string;
  sender: {
    fullName: string;
    profileImage?: string | null;
  };
  you?: boolean;
  status?: string;
}

interface ChatMessagesProps {
  messageData: Message[];
  activeChatObject: ChatChannelType | GroupChat;
  activeChatType?: "individual" | "group";
  groupCreatedBy?: GroupCreatedBy;
}
const ChatMessages: React.FC<ChatMessagesProps> = ({
  messageData,
  activeChatObject,
  activeChatType,
  groupCreatedBy,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loginUserProviderId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.id,
  );
  const loginUserUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.userId,
  );
  const loginUserProfileImage = useSelector(
    (state: RootState) =>
      state?.LoginUserDetail?.userDetails?.user.profileImage,
  );

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const markMessagesAsRead = async () => {
    if (!activeChatObject?.id || !loginUserProviderId) return;

    try {
      if (activeChatType === "individual") {
        await messageApiService.readMessageSingleConservation({
          loginUserId: loginUserProviderId,
          chatChannelId: activeChatObject.id,
        });
        queryClient.invalidateQueries({ queryKey: ["chatchannels"] });
      } else {
        await messageApiService.readMessageGroupConservation({
          loginUserId: loginUserProviderId,
          groupId: activeChatObject.id,
        });
        queryClient.invalidateQueries({ queryKey: ["groupChatchannels"] });
      }

      setUnreadCounts({});
    } catch (error) {
      console.error(" Failed to mark messages as read:", error);
    }
  };

  const socket = getSocket();
  useEffect(() => {
    if (Array.isArray(messageData)) {
      const mappedMessages = messageData.map((msg) => ({
        ...msg,
        you: msg?.senderId === loginUserUserId,
      }));
      setMessages(mappedMessages);

      const counts: Record<string, number> = {};
      mappedMessages.forEach((msg) => {
        if (!msg.you && msg.senderId !== loginUserUserId) {
          counts[msg.senderId] = (counts[msg.senderId] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    } else {
      setMessages([]);
      setUnreadCounts({});
    }
  }, [messageData, loginUserUserId]);

  useEffect(() => {
    if (!socket || !activeChatObject) return;
    const handleIncoming = (newMsg: Message) => {
      const isSameGroup =
        activeChatType === "group" && newMsg.groupId === activeChatObject?.id;

      const isSameIndividual =
        activeChatType === "individual" &&
        newMsg.chatChannelId === activeChatObject?.id;

      const isSameChat = isSameGroup || isSameIndividual;

      if (!isSameChat) return;

      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m.id === newMsg.id);
        if (alreadyExists) return prev;

        const updatedMessage = {
          ...newMsg,
          you: newMsg.senderId === loginUserUserId,
        };

        if (!updatedMessage.you) {
          setUnreadCounts((prevCounts) => ({
            ...prevCounts,
            [newMsg.senderId]: (prevCounts[newMsg.senderId] || 0) + 1,
          }));
        }

        return [...prev, updatedMessage];
      });
    };

    socket.off("receive_direct");
    socket.off("receive_group");

    if (activeChatType === "individual") {
      socket.on("receive_direct", handleIncoming);
    } else if (activeChatType === "group") {
      socket.on("receive_group", handleIncoming);
    }

    return () => {
      socket.off("receive_direct", handleIncoming);
      socket.off("receive_group", handleIncoming);
    };
  }, [activeChatObject?.id, activeChatType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const hasUnread = Object.values(unreadCounts).some((count) => count > 0);
    if (hasUnread) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, unreadCounts]);



  useEffect(() => {
    if (socket && activeChatObject?.id) {
      socket.emit("join_channel", { chatChannelId: activeChatObject.id });
      console.log("✅ Joined chat channel:");
    }
  }, [activeChatObject?.id]);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (currentPage = 1) => {
    if (!activeChatObject) return;

    const container = messageContainerRef.current;
    const oldScrollHeight = container?.scrollHeight || 0;

    setLoading(true);

    try {
      const payload = {
        loginUserId: loginUserProviderId,
        page: currentPage,
        limit: 10,
        ...(activeChatType === "individual"
          ? { chatChannelId: activeChatObject.id }
          : { groupId: activeChatObject.id }),
      };

      let res;
      let newMessages: Message[] = [];

      if (activeChatType === "individual") {
        res =
          await messageApiService.getAllMessagesOfSingleChatChannel(payload);
        newMessages = res?.data?.messages || [];
      } else {
        res = await messageApiService.getAllMessagesOfGroupChatChannel(payload);
        newMessages = res?.data?.groupMessages || [];
      }

      setMessages((prev) => [
        ...newMessages.map((m) => ({
          ...m,
          you: m.senderId === loginUserUserId,
        })),
        ...prev,
      ]);

      setHasMore(res?.data?.hasMore);
      setPage(currentPage);

      // Maintain scroll position
      setTimeout(() => {
        const newScrollHeight = container?.scrollHeight || 0;
        if (container) {
          container.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!socket || !loginUserUserId) return;

    const handleNewMessage = (newMessage: NewMessage) => {
      const isGroup = newMessage?.isGroupMessage;
      const queryKey = isGroup ? ["groupChatchannels"] : ["chatchannels"];

      // Update sidebar chat list for both individual and group chats
      queryClient.setQueryData(queryKey, (oldData: ChatChannelType[] = []) =>
        oldData.map((channel) =>
          channel.id === newMessage.chatChannelId
            ? {
                ...channel,
                lastMessage: {
                  id: newMessage.id!,
                  message: newMessage.message || "New Message",
                  createdAt: newMessage.createdAt || new Date().toISOString(),
                },
                ...(isGroup
                  ? {
                      unreadCount:
                        newMessage.senderId === loginUserUserId
                          ? channel.unreadCount
                          : Number(channel.unreadCount || 0) + 1,
                    }
                  : {
                      totalUnread:
                        newMessage.senderId === loginUserUserId
                          ? channel.totalUnread
                          : Number(channel.totalUnread || 0) + 1,
                    }),
                updatedAt: new Date().toISOString(),
              }
            : channel,
        ),
      );
    };

    socket.on("receive_direct", handleNewMessage);
    socket.on("receive_group", handleNewMessage);

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    const handleChatChannelDeleted = ({
      chatChannelId,
    }: {
      chatChannelId: string;
    }) => {
      if (activeChatObject?.id === chatChannelId) {
        queryClient.invalidateQueries({ queryKey: ["chatchannels"] });
      }
    };

    socket.on("message_deleted", handleMessageDeleted);
    socket.on("chat_channel_deleted", handleChatChannelDeleted);

    return () => {
      socket.off("receive_direct", handleNewMessage);
      socket.off("receive_group", handleNewMessage);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("chat_channel_deleted", handleChatChannelDeleted);
    };
  }, [socket, loginUserUserId, queryClient, activeChatObject?.id]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loading) {
        fetchMessages(page + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading]);

  if (!activeChatObject) {
    return (
      <div className="p-4 text-center">
        Select a conversation to start chatting
      </div>
    );
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: Record<string, Message[]> = {};

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const getGroupKey = (dateStr: string) => {
      const date = new Date(dateStr);
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return "Today";
      } else if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }); // e.g., 6 May 2025
      }
    };

    for (const msg of messages) {
      const key = getGroupKey(msg.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    }

    return groups;
  };

  const otherName = activeChatObject?.name
    ? activeChatObject?.name
    : (activeChatObject as ChatChannelType)?.providerA?.id === loginUserUserId
      ? (activeChatObject as ChatChannelType)?.providerB?.fullName
      : (activeChatObject as ChatChannelType)?.providerA?.fullName;

  return (
    <>
      <div className="bg-white p-3 rounded-lg h-full flex flex-col">
        <ChatNavbar
          name={otherName}
          id={activeChatObject.id}
          groupMembers={(activeChatObject?.members as GroupMember[]) ?? []}
          groupCreatedBy={groupCreatedBy}
          membersCanInvite={(activeChatObject as any)?.membersCanInvite}
        />{" "}
        <hr className="my-4 border-inputBgColor" />
        <div className="flex-1 overflow-y-auto mb-4" ref={messageContainerRef}>
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              No messages yet
            </div>
          )}
          {loading && <SpinnerLoader text="Messages are Loading" />}

          {Object.entries(groupMessagesByDate(messages)).map(
            ([dateGroup, groupMsgs]) => (
              <div key={dateGroup} className="flex flex-col">
                <div className="flex justify-center my-4 sticky top-0 z-10">
                  <span className="bg-[#EAF5F4] text-textGreyColor px-4 py-1 rounded-full text-xs font-medium shadow-sm">
                    {dateGroup}
                  </span>
                </div>
                {groupMsgs.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    msg={msg}
                    markMessagesAsRead={markMessagesAsRead}
                    loginUserProfileImage={loginUserProfileImage}
                    channelId={activeChatObject?.id}
                    loginUserProviderId={loginUserProviderId}
                    setMessages={setMessages}
                    socket={socket}
                  />
                ))}
              </div>
            ),
          )}

          <div ref={messagesEndRef} />
        </div>
        <hr className="my-4 border-inputBgColor" />
        
        <ChatInput
          activeChatObject={activeChatObject}
          activeChatType={activeChatType}
          setMessages={setMessages}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </>
  );
};

export default ChatMessages;
