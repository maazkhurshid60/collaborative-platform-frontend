
import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import chatApiService from '../../../apiServices/chatApi/ChatApi';
import messageApiService, { getAllMessagesOfSingleChat } from '../../../apiServices/chatApi/messagesApi/MessagesApi';
import { getSocket, initSocket } from '../../../socket/Socket';
import ChatMessages from '../../../components/pagesComponent/chat/chatMessages/ChatMessages';
import ModalLayout from '../../../components/modals/modalLayout/ModalLayout';
import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import { MdOutlineMail } from "react-icons/md";
import SingleChatData from '../../../components/pagesComponent/chat/singleChatMessage/SingleChatData';
import NewChatModal from '../../../components/modals/providerModal/chatModal/NewChatModal';
import {
  isNewChatModalShowReducser,
  isNewGroupChatModalShowReducser,
  isInviteProviderModalShowReducser,
  isInviteToGroupModalShowReducer,
} from '../../../redux/slices/ModalSlice';
import { toast } from 'react-toastify';
import { ChatChannelType } from '../../../types/chatType/ChatChannelType';
import ChatModalBodyContent from '../../../components/modals/providerModal/chatModal/ChatModalBodyContent';
import NewGroupChatModal from '../../../components/modals/providerModal/chatModal/NewGroupChatModal';
import GroupChatData from '../../../components/pagesComponent/chat/groupChatData/GroupChatData';
import { HiOutlineUserAdd } from "react-icons/hi";
import { GroupChat, GroupCreatedBy } from '../../../types/chatType/GroupType';
import { Group, Message, NewMessage } from '../../../types/chatType/ChatType';
import ToolTip from '../../../components/toolTip/ToolTip';
import SpinnerLoader from '../../../components/loader/SpinnerLoader';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import InviteProviderModal from "../../../components/modals/providerModal/chatModal/InviteProviderModal";
import InviteToGroupModalBody from '../../../components/modals/providerModal/chatModal/InviteToGroupModalBody';
import { useSubscription } from '../../../hooks/useSubscription';

const Chat = () => {
  const { isTrialActive } = useSubscription();

  const loginUserProviderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
  const loginUserUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId);

  const isNewChatModal = useSelector((state: RootState) => state?.modalSlice?.isNewChatModal);
  const isNewGroupChatModal = useSelector((state: RootState) => state?.modalSlice?.isNewGroupChatModal);
  const isModalShow = useSelector((state: RootState) => state?.modalSlice?.isModalShow);

  const isInviteProviderModal = useSelector((state: RootState) => state?.modalSlice?.isInviteProviderModal);
  const isInviteToGroupModalShow = useSelector((state: RootState) => state?.modalSlice?.isInviteToGroupModalShow);

  const [activeChatObject, setActiveChatObject] = useState<ChatChannelType | GroupChat | undefined>(undefined);
  const [isChatSideBarClose, setIsChatSideBarClose] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string>();
  const [groupCreatedBy, setGroupCreatedBy] = useState<GroupCreatedBy>({ name: "", id: "" });
  const [activeChatType, setActiveChatType] = useState<'individual' | 'group' | undefined>(undefined);

  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const isGroup = location.pathname.includes("/chat/group/");

  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const socket = getSocket();

  const { data: allChannels = [], isLoading: isChannelsLoading } = useQuery({
    queryKey: ['chatchannels'],
    queryFn: async () => {
      const res = await chatApiService.getAllChatChannels(loginUserProviderId);
      const channels = res.data.findAllChatChannel || [];

      return channels.sort((a: GroupChat, b: GroupChat) => {
        const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime; // latest first
      });
    },
  });

  const { data: allGroups = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ['groupChatchannels'],
    queryFn: async () => {
      const res = await chatApiService.getGroupChatChannels(loginUserUserId);
      const groups = res?.data?.allgroups || [];
      return groups.sort((a: GroupChat, b: GroupChat) => {
        const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime; // latest group sabse upar
      });
    },
    staleTime: 30 * 1000, // prevent background refetch from resetting socket-updated unreadCount
  });


  useEffect(() => {
    // If there's an ID in the URL, try to find and set the active chat
    if (id) {
      if (isGroup) {
        const group = allGroups.find((g: any) => g.id === id);
        if (group) {
          setActiveChatObject(group);
          setActiveChatType("group");
          setActiveId(group.id);
          setGroupCreatedBy({
            id: group?.provider?.id,
            name: group?.provider?.user?.fullName
          });
        }
      } else {
        const channel = allChannels.find((c: any) => c.id === id);
        if (channel) {
          setActiveChatObject(channel);
          setActiveChatType("individual");
          setActiveId(channel.id);
        }
      }
    } else {
      // Only clear if we are explicitly at the base /chat route with no active selection
      // This prevents the flicker when clicking sidebar items before navigation completes
      setActiveChatObject(undefined);
      setActiveChatType(undefined);
      setActiveId(undefined);
    }
  }, [id, isGroup, allChannels, allGroups]);

  useEffect(() => {
    if (!loginUserProviderId || (!allChannels?.length && !allGroups?.length)) return;

    const socket = getSocket();

    const joinAllRooms = () => {
      allChannels?.forEach((channel: ChatChannelType) => {
        socket?.emit("join_channel", { chatChannelId: channel?.id });
      });

      // Join group chats
      allGroups?.forEach((group: Group) => {
        socket?.emit("join_channel", { chatChannelId: group?.id });
      });
    };

    if (socket && socket.connected) {
      joinAllRooms();
    } else if (socket) {
      socket.on('connect', joinAllRooms);
    }

    return () => {
      socket?.off('connect', joinAllRooms);
    };
  }, [loginUserProviderId, allChannels, allGroups]);

  const { data: allMessage = [] } = useQuery<Message[]>({
    queryKey: ['messages', activeChatObject?.id],
    queryFn: async () => {
      if (!activeChatObject?.id) {
        toast.error("Chat channel ID is missing.");
        return [];
      }
      const dataSendToBack = { loginUserId: loginUserProviderId, chatChannelId: activeChatObject?.id };
      try {
        const response = await messageApiService.getAllMessagesOfSingleChatChannel(dataSendToBack);
        return response?.data?.messages;
      } catch (_error) {
        return [];
      }
    },
    enabled: !!activeChatObject?.id && activeChatType === 'individual',
  });

  const { data: allGroupMessage = [] } = useQuery<Message[]>({
    queryKey: ["groupmessages", activeChatObject?.id],
    queryFn: async () => {
      if (!activeChatObject?.id) return [];

      const dataSendToBack: getAllMessagesOfSingleChat = {
        loginUserId: loginUserProviderId,
        page: 1,
        limit: 10,
        groupId: activeChatObject?.id,
      };

      try {
        const response = await messageApiService.getAllMessagesOfGroupChatChannel(dataSendToBack);
        return response?.data?.groupMessages ?? [];
      } catch (_error) {
        return [];
      }
    },
    enabled: !!activeChatObject?.id && activeChatType === "group",
  });

  /* socket managed globally */

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      const isSameChatOpen =
        (activeChatType === 'individual' && newMessage.chatChannelId === activeChatObject?.id) ||
        (activeChatType === 'group' && newMessage.groupId === activeChatObject?.id);
      const isFromSelf = newMessage.senderId === loginUserUserId;

      queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], (oldData) => {
        if (!oldData) return oldData;

        const updatedChannels = oldData.map((channel) => {
          if (channel.id === newMessage.chatChannelId) {
            return {
              ...channel,
              lastMessage: {
                id: newMessage.id!,
                message: newMessage.message || '📎 File',
                createdAt: newMessage.createdAt || new Date().toISOString(),
                mediaUrl: newMessage.mediaUrl,
                type: newMessage.type,
              },
              totalUnread:
                isFromSelf || isSameChatOpen
                  ? channel.totalUnread
                  : (Number(channel.totalUnread) || 0) + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return channel;
        });

        return updatedChannels;
      });

      queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], (oldGroups = []) => {
        return oldGroups.map(group => {
          if (group?.id === newMessage.groupId) {
            return {
              ...group,
              lastMessage: {
                id: newMessage.id,
                message: newMessage.message || "📎 File",
                createdAt: newMessage.createdAt || new Date().toISOString(),
                mediaUrl: newMessage.mediaUrl,
                type: newMessage.type,
              },
              unreadCount:
                isFromSelf || isSameChatOpen
                  ? group.unreadCount
                  : (Number(group.unreadCount) || 0) + 1,
              updatedAt: `${new Date().toISOString()}_${Math.random()}`,
            };
          }

          return {
            ...group,
            updatedAt: `${group.updatedAt}_${Math.random()}`
          };
        });
      });

      if (isSameChatOpen) {
        const messageKey =
          activeChatType === 'individual'
            ? ['messages', newMessage.chatChannelId]
            : ['groupmessages', newMessage.groupId];

        queryClient.setQueryData<NewMessage[]>(messageKey, (old = []) => {
          if (old.some((m) => m.id === newMessage.id)) return old;
          return [...old, newMessage as NewMessage];
        });

        // ✅ Mark as read on backend immediately if chat is open
        if (activeChatType === 'individual') {
          messageApiService.readMessageSingleConservation({
            loginUserId: loginUserProviderId,
            chatChannelId: activeChatObject?.id,
          });
        } else {
          messageApiService.readMessageGroupConservation({
            loginUserId: loginUserProviderId,
            groupId: activeChatObject?.id,
          });
        }
      }
    };

    socket.off('receive_direct', handleNewMessage);
    socket.off('receive_group', handleNewMessage);
    socket.on('receive_group', handleNewMessage);
    socket.on('receive_direct', handleNewMessage);

    return () => {
      socket.off('receive_group', handleNewMessage);
      socket.off('receive_direct', handleNewMessage);
    };
  }, [loginUserProviderId, loginUserUserId, activeChatObject?.id, activeChatType, queryClient]);

  return (
    <OutletLayout isWhiteColor={false}>
      {isModalShow && (
        <ModalLayout
          heading="Share this chat by generating a link"
          modalBodyContent={<ChatModalBodyContent id={activeChatObject?.id} chatType={activeChatType} />}
        />
      )}

      {isInviteToGroupModalShow && (
        <ModalLayout
          heading="Invite to Group"
          onClose={() => dispatch(isInviteToGroupModalShowReducer(false))}
          modalBodyContent={<InviteToGroupModalBody id={activeChatObject?.id} />}
        />
      )}

      {isNewChatModal && <ModalLayout heading="Start chat with a provider" modalBodyContent={<NewChatModal />} />}
      {isNewGroupChatModal && <ModalLayout heading="New Chat Group" modalBodyContent={<NewGroupChatModal />} />}

      {/* ✅ Invite Provider Modal (fixed close) */}
      {isInviteProviderModal && (
        <ModalLayout
          heading="Invite Provider"
          onClose={() => dispatch(isInviteProviderModalShowReducser(false))}
          modalBodyContent={
            <InviteProviderModal
              onClose={() => dispatch(isInviteProviderModalShowReducser(false))}
            />
          }
        />
      )}

      <div className="flex items-start lg:justify-between relative h-[80vh]">
        <div
          className={`w-full border-r h-full border-r-solid border-r-inputBgColor p-4 lg:w-[35%] xl:w-[25%] bg-white rounded-[10px] absolute z-30 lg:relative ${isChatSideBarClose ? 'left-0' : '-left-[200%] lg:left-0'}`}
        >
          <div className='flex items-center justify-between '>
            <p className="font-medium text-[14px] text-textGreyColor">Recent Chats</p>

            <div className='flex items-center gap-3'>
              {/* Existing button */}
              <div className='relative group'>
                <HiOutlineUserAdd
                  className='cursor-pointer text-xl text-textGreyColor'
                  onClick={() => dispatch(isNewChatModalShowReducser(true))}
                />
                <ToolTip toolTipText='Start chat with a provider on the platform' />
              </div>

              {/* ✅ Invite provider by email (icon changed) */}
              <div className='relative group'>
                <MdOutlineMail
                  className='cursor-pointer text-xl text-textGreyColor'
                  onClick={() => dispatch(isInviteProviderModalShowReducser(true))}
                />
                <ToolTip toolTipText='Invite provider by email' />
              </div>
            </div>
          </div>

          <div className="min-h-[31vh] max-h-[31vh] bg- p-2 lg:p-0 overflow-auto mt-4">
            {isChannelsLoading ? <SpinnerLoader text="Chats are Loading" /> :
              allChannels
                ?.sort((a: ChatChannelType, b: ChatChannelType) => {
                  const aTime = new Date(a?.updatedAt)?.getTime();
                  const bTime = new Date(b?.updatedAt)?.getTime();
                  return bTime - aTime;
                })
                ?.map((data: ChatChannelType) => (
                  <SingleChatData
                    key={`${data?.id}-${data?.updatedAt}`}
                    data={data}
                    activeId={activeId}
                    onClick={() => {
                      navigate(`/chat/individual/${data.id}`);
                      setIsMessagesLoading(true);
                      setActiveChatObject(data);
                      setIsChatSideBarClose(false);
                      setActiveId(data?.id);
                      setActiveChatType('individual');

                      messageApiService.readMessageSingleConservation({
                        loginUserId: loginUserProviderId,
                        chatChannelId: data.id,
                      }).then(() => {
                        queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], oldData => {
                          if (!oldData) return oldData;

                          return oldData.map(channel =>
                            channel.id === data.id
                              ? {
                                ...channel,
                                totalUnread: 0,
                                //updatedAt: new Date().toISOString()
                              }
                              : channel
                          );
                        });

                      }).catch((_err) => {
                      }).finally(() => {
                        setIsMessagesLoading(false);
                      });
                    }}
                  />
                ))
            }
          </div>

          <hr className="w-full h-px text-inputBgColor" />

          <div className='flex items-center justify-between mt-4'>
            <p className=" font-medium text-[14px] p-2 lg:p-0 text-textGreyColor">Group Chats</p>
            <div className='relative group'>
              <HiOutlineUserAdd
                className='cursor-pointer text-xl text-textGreyColor'
                onClick={() => {
                  if (isTrialActive) {
                    toast.info("Group chats are not available on the Free Trial. Please upgrade your plan.");
                  } else {
                    dispatch(isNewGroupChatModalShowReducser(true));
                  }
                }}
              />
              <ToolTip toolTipText='Add New Group' />
            </div>
          </div>

          <div className="min-h-[32vh] max-h-[32vh] bg- p-2 lg:p-0 overflow-auto mt-4">
            {isGroupsLoading ?
              <SpinnerLoader text="Group Chat are Loading" /> : allGroups
                ?.sort((a: GroupChat, b: GroupChat) => {
                  const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
                  const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
                  return bTime - aTime; // Latest messages first
                })
                ?.map((data: GroupChat) => {
                  return (
                    <div className="gap-y-3" key={data?.id}>
                      <GroupChatData
                        key={`${data?.id}-${data?.updatedAt}`}
                        data={data}
                        activeId={activeId}
                        onClick={() => {
                          navigate(`/chat/group/${data.id}`);
                          setGroupCreatedBy({ id: data?.provider?.id, name: data?.provider?.user?.fullName })
                          setIsMessagesLoading(true);
                          setActiveChatObject(data);
                          setIsChatSideBarClose(false);
                          setActiveId(data?.id);
                          setActiveChatType('group');

                          if (socket?.connected && data?.id) {
                            socket.emit('join_channel', { chatChannelId: data.id });
                          }

                          messageApiService.readMessageGroupConservation({
                            loginUserId: loginUserProviderId,
                            groupId: data?.id,
                          }).then(() => {
                            queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], oldData => {
                              if (!oldData) return oldData;
                              return oldData?.map(group =>
                                group?.id === data?.id
                                  ? {
                                    ...group,
                                    unreadCount: 0,
                                    // updatedAt: new Date().toISOString(),
                                  }
                                  : group
                              );
                            });
                          }).catch((_err) => {
                            toast.error('Failed to update read status');
                          }).finally(() => {
                            setIsMessagesLoading(false);
                          });
                        }}
                      />
                    </div>
                  );
                })}
          </div>
        </div>

        <div className="w-full lg:w-[65%] xl:w-[74.5%] bg-white h-[80vh] rounded-[10px]">
          <IoIosArrowBack
            size={24}
            className="mb-2 text-textGreyColor lg:hidden"
            onClick={() => setIsChatSideBarClose(true)}
          />

          {isMessagesLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <SpinnerLoader text='Loading messages' />
              </div>
            </div>
          ) : (
            activeChatType === 'individual' && allMessage ? (
              <ChatMessages messageData={allMessage} activeChatObject={activeChatObject!} activeChatType={activeChatType} />
            ) : activeChatType === 'group' && allGroupMessage ? (
              <ChatMessages messageData={allGroupMessage} activeChatObject={activeChatObject!} activeChatType={activeChatType} groupCreatedBy={groupCreatedBy} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                  alt="Select chat"
                  className="w-32 h-32 opacity-70 mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-600">No Chat Selected</h2>
                <p className="text-gray-400 mt-2 text-sm">Please choose a conversation to start messaging.</p>
              </div>
            )
          )}
        </div>
      </div>
    </OutletLayout>
  );
};

export default Chat;

