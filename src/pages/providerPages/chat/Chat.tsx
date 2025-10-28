import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import chatApiService from '../../../apiServices/chatApi/ChatApi';
import messageApiService, { getAllMessagesOfSingleChat } from '../../../apiServices/chatApi/messagesApi/MessagesApi';
import { getSocket, initSocket } from '../../../socket/Socket'; // Correct import
import ChatMessages from '../../../components/pagesComponent/chat/chatMessages/ChatMessages';
import ModalLayout from '../../../components/modals/modalLayout/ModalLayout';
import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import SingleChatData from '../../../components/pagesComponent/chat/singleChatMessage/SingleChatData';
import NewChatModal from '../../../components/modals/providerModal/chatModal/NewChatModal';
import { isNewChatModalShowReducser, isNewGroupChatModalShowReducser } from '../../../redux/slices/ModalSlice';
import { toast } from 'react-toastify';
import { ChatChannelType } from '../../../types/chatType/ChatChannelType';
import ChatModalBodyContent from '../../../components/modals/providerModal/chatModal/ChatModalBodyContent';
import NewGroupChatModal from '../../../components/modals/providerModal/chatModal/NewGroupChatModal';
import GroupChatData from '../../../components/pagesComponent/chat/groupChatData/GroupChatData';
import { HiOutlineUserAdd } from "react-icons/hi";
import providerApiService from '../../../apiServices/providerApi/ProviderApi';
import { ProviderType } from '../../../types/providerType/ProviderType';
import { GroupChat, GroupCreatedBy } from '../../../types/chatType/GroupType';
import { Group, Message, NewMessage } from '../../../types/chatType/ChatType';
import ToolTip from '../../../components/toolTip/ToolTip';
import SpinnerLoader from '../../../components/loader/SpinnerLoader';




const Chat = () => {
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    const isNewChatModal = useSelector((state: RootState) => state?.modalSlice?.isNewChatModal);
    const isNewGroupChatModal = useSelector((state: RootState) => state?.modalSlice?.isNewGroupChatModal);
    const isModalShow = useSelector((state: RootState) => state?.modalSlice?.isModalShow);
    const [activeChatObject, setActiveChatObject] = useState<ChatChannelType | GroupChat | undefined>(undefined);
    const [isChatSideBarClose, setIsChatSideBarClose] = useState<boolean>(false);
    const [activeId, setActiveId] = useState<string>()
    const [groupCreatedBy, setGroupCreatedBy] = useState<GroupCreatedBy>({ name: "", id: "" })
    const [activeChatType, setActiveChatType] = useState<'individual' | 'group' | undefined>(undefined);

    const [isMessagesLoading, setIsMessagesLoading] = useState(false);


    const queryClient = useQueryClient();
    const dispatch = useDispatch<AppDispatch>()
    const socket = getSocket();




    // GET ALL CHANNELS
    const { data: allChannels = [],

        isLoading: isChannelsLoading,
    } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserId);
            const channels = res.data.findAllChatChannel || [];

            // 🔥 Sort by latest lastMessage or updatedAt
            return channels.sort((a: GroupChat, b: GroupChat) => {
                const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
                const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
                return bTime - aTime; // latest first
            });
        },
    });

    // GET ALL GROUPS
    const { data: allGroups = [],
        isLoading: isGroupsLoading,


    } = useQuery({
        queryKey: ['groupChatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getGroupChatChannels(loginUserId);
            const groups = res?.data?.allgroups || [];
            // 🔥 Sort karo lastMessage ke time ya updatedAt ke basis pe
            return groups.sort((a: GroupChat, b: GroupChat) => {
                const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
                const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
                return bTime - aTime; // latest group sabse upar
            });
        },
    });






    // useEffect(() => {
    //     if (!loginUserId || !allGroups?.length) return;

    //     // disconnectSocket(); // Ensure no stale socket
    //     const socket = initSocket(loginUserId);

    //     const joinAllGroupRooms = () => {
    //         allGroups?.forEach((group: Group) => {
    //             if (group?.id) {
    //                 socket.emit('join_channel', { chatChannelId: group?.id });
    //             }
    //         });
    //     };

    //     if (socket.connected) {
    //         joinAllGroupRooms();
    //     } else {
    //         socket.on('connect', () => {
    //             joinAllGroupRooms();
    //         });
    //     }
    // }, [loginUserId, allGroups]);


    useEffect(() => {
        if (!loginUserId || (!allChannels?.length && !allGroups?.length)) return;

        const socket = initSocket(loginUserId, "");

        const joinAllRooms = () => {
            // Join individual 1-on-1 chats
            allChannels?.forEach((channel: ChatChannelType) => {
                socket.emit("join_channel", { chatChannelId: channel?.id });
                console.log("📥 Joined 1-on-1 chat room");
            });

            // Join group chats
            allGroups?.forEach((group: Group) => {
                socket.emit("join_channel", { chatChannelId: group?.id });
                console.log("📥 Joined group room");
            });
        };

        if (socket.connected) {
            joinAllRooms();
        } else {
            socket.on('connect', joinAllRooms);
        }

        return () => {
            socket.off('connect', joinAllRooms);
        };
    }, [loginUserId, allChannels, allGroups]);



    const { data: allMessage = [] } = useQuery<Message[]>({
        queryKey: ['messages', activeChatObject?.id],
        queryFn: async () => {
            if (!activeChatObject?.id) {
                toast.error("Chat channel ID is missing.");
                return [];
            }
            const dataSendToBack = { loginUserId, chatChannelId: activeChatObject?.id };
            try {
                const response = await messageApiService.getAllMessagesOfSingleChatChannel(dataSendToBack);
                return response?.data?.messages;
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        },
        enabled: !!activeChatObject?.id && activeChatType === 'individual',
    });



    // React Query to fetch messages for the active group chat
    const { data: allGroupMessage } = useQuery<Message[]>({
        queryKey: ['groupmessages', activeChatObject?.id],
        queryFn: async () => {
            if (!activeChatObject?.id) {
                toast.error("Group channel ID is missing.");
                return;
            }
            // const dataSendToBack = { loginUserId, groupId: activeChatObject?.id };
            const dataSendToBack: getAllMessagesOfSingleChat = {
                loginUserId,
                page: 1,
                limit: 10,
                groupId: activeChatObject?.id
            };

            try {
                const response = await messageApiService.getAllMessagesOfGroupChatChannel(dataSendToBack);
                return response?.data?.groupMessages;
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        },
        enabled: !!activeChatObject?.id && activeChatType === 'group',
    });



    useEffect(() => {
        if (loginUserId) {
            // disconnectSocket(); // Always clear previous socket
            initSocket(loginUserId, "");
        }
    }, [loginUserId]);

    const { data: providerData } = useQuery<ProviderType[]>({
        queryKey: ["providers"],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllProviders(loginUserDetail);
                return response?.data?.providers; // Ensure it always returns an array

            } catch (error) {
                console.error("Error fetching providers:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })



    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewMessage = (newMessage: Message) => {

            const isSameChatOpen =
                (activeChatType === 'individual' && newMessage.chatChannelId === activeChatObject?.id) ||
                (activeChatType === 'group' && newMessage.groupId === activeChatObject?.id);
            const isFromSelf = newMessage.senderId === loginUserId;

            // ✅ Always update single chat sidebar
            queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], (oldData) => {
                if (!oldData) return oldData;

                const updatedChannels = oldData.map((channel) => {
                    if (channel.id === newMessage.chatChannelId) {
                        return {
                            ...channel,
                            lastMessage: {
                                id: newMessage.id!,
                                message: newMessage.message || newMessage.mediaUrl || '📎 File',
                                createdAt: newMessage.createdAt || new Date().toISOString(),
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

            // ✅ Update group chat sidebar
            queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], (oldGroups = []) => {
                return oldGroups.map(group => {
                    if (group?.id === newMessage.groupId) {
                        return {
                            ...group,
                            lastMessage: {
                                id: newMessage.id,
                                message: newMessage.message || newMessage.mediaUrl || "📎 File",
                                createdAt: newMessage.createdAt || new Date().toISOString(),
                            },
                            unreadCount:
                                newMessage.senderId === loginUserId
                                    ? group.unreadCount
                                    : (Number(group.unreadCount) || 0) + 1,
                            // Force timestamp change
                            updatedAt: `${new Date().toISOString()}_${Math.random()}`,
                        };
                    }

                    // Force rerender by creating new object
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

                // queryClient.setQueryData<{ messages: NewMessage[] }>(messageKey, (old) => {
                //     if (!old) return { messages: [newMessage as NewMessage] };
                //     if (old.messages.some((m) => m.id === newMessage.id)) return old;
                //     return { messages: [...old.messages, newMessage as NewMessage] };
                // });

                queryClient.setQueryData<NewMessage[]>(messageKey, (old = []) => {
                    if (old.some((m) => m.id === newMessage.id)) return old;
                    return [...old, newMessage as NewMessage];
                });

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
    }, [loginUserId, activeChatObject?.id, activeChatType, queryClient]);






    return (
        <OutletLayout isWhiteColor={false}>
            {isModalShow && (
                <ModalLayout
                    heading="Share this chat by generating a link"
                    modalBodyContent={<ChatModalBodyContent id={activeChatObject?.id} chatType={activeChatType} />}
                />
            )}

            {isNewChatModal && <ModalLayout heading="New Chat with" modalBodyContent={<NewChatModal />} />}
            {isNewGroupChatModal && <ModalLayout heading="New Chat Group" modalBodyContent={<NewGroupChatModal />} />}



            <div className="flex items-start lg:justify-between relative h-[80vh]">
                <div
                    className={`w-[100%] border-r-[1px] border-r-solid border-r-inputBgColor p-4 lg:w-[35%] xl:w-[25%] bg-white rounded-[10px] absolute z-30 lg:relative ${isChatSideBarClose ? 'left-0' : '-left-[200%] lg:left-0'}`}
                >
                    <div className='flex items-center justify-between '>

                        <p className="font-medium text-[14px] text-textGreyColor">Recent Chats</p>
                        <div className='relative group'>

                            <HiOutlineUserAdd className='cursor-pointer text-xl text-textGreyColor' onClick={() => dispatch(isNewChatModalShowReducser(true))} />
                            <ToolTip toolTipText='Start chat with new Provider' />
                        </div>
                    </div>
                    <div className="min-h-[31vh] max-h-[31vh] bg- p-2 lg:p-0 overflow-auto mt-4">
                        {isChannelsLoading ? <SpinnerLoader text="Chats are Loading" /> :

                            allChannels
                                ?.filter((channel: ChatChannelType) =>
                                    providerData?.some((provider) => channel?.providerBId === provider?.id)
                                )
                                ?.sort((a: ChatChannelType, b: ChatChannelType) => {
                                    const aTime = new Date(a?.updatedAt)?.getTime();
                                    const bTime = new Date(b?.updatedAt)?.getTime();
                                    return bTime - aTime;
                                })
                                ?.map((data: ChatChannelType) => (
                                    <SingleChatData
                                        key={`${data.id}-${data.updatedAt}`}
                                        data={data}
                                        activeId={activeId}
                                        onClick={() => {
                                            setIsMessagesLoading(true);
                                            setActiveChatObject(data);
                                            setIsChatSideBarClose(false);
                                            setActiveId(data?.id);
                                            setActiveChatType('individual');

                                            // const socket = getSocket();
                                            // if (socket?.connected && data?.id) {
                                            //     socket.emit('join_channel', { chatChannelId: data.id });
                                            // }
                                            messageApiService.readMessageSingleConservation({
                                                loginUserId,
                                                chatChannelId: data.id,
                                            }).then(() => {
                                                // Update unread count in cache to 0
                                                queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], oldData => {
                                                    if (!oldData) return oldData;

                                                    return oldData.map(channel =>
                                                        channel.id === data.id
                                                            ? {
                                                                ...channel,
                                                                totalUnread: 0,
                                                                updatedAt: new Date().toISOString() // <-- optional but safe
                                                            }
                                                            : channel
                                                    );
                                                });

                                            }).catch((err) => {
                                                console.error('Failed to mark messages as read', err);
                                            }).finally(() => {
                                                setIsMessagesLoading(false);
                                            });
                                        }}

                                    />

                                ))
                        }

                    </div>
                    <hr className="w-[100%] h-[1px] text-inputBgColor" />
                    <div className='flex items-center justify-between mt-4'>

                        <p className=" font-medium text-[14px] p-2 lg:p-0 text-textGreyColor">Group Chats</p>
                        <div className='relative group'>

                            <HiOutlineUserAdd className='cursor-pointer text-xl text-textGreyColor' onClick={() => dispatch(isNewGroupChatModalShowReducser(true))} />
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
                                    // toast.warn(`Rendering group: || 'Unnamed Group'}`); // Will run for each group render

                                    return (
                                        <div className="gap-y-3" key={data?.id}>
                                            <GroupChatData
                                                key={`${data?.id}-${data?.updatedAt}`}
                                                data={data}
                                                activeId={activeId}
                                                onClick={() => {
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
                                                        loginUserId,
                                                        groupId: data?.id,
                                                    }).then(() => {
                                                        queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], oldData => {
                                                            if (!oldData) return oldData;
                                                            return oldData?.map(group =>
                                                                group?.id === data?.id
                                                                    ? {
                                                                        ...group,
                                                                        unreadCount: 0,
                                                                        updatedAt: new Date().toISOString(),
                                                                    }
                                                                    : group
                                                            );
                                                        });
                                                    }).catch((err) => {
                                                        console.error('Failed to mark messages as read', err);
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

                <div className="w-[100%] lg:w-[65%] xl:w-[74.5%] bg-white h-[80vh] rounded-[10px]">
                    <IoIosArrowBack
                        size={24}
                        className="mb-2 text-textGreyColor lg:hidden"
                        onClick={() => setIsChatSideBarClose(true)}
                    />

                    {isMessagesLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <svg
                                    className="w-5 h-5 animate-spin text-primaryColorDark"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                    ></path>
                                </svg>
                                <span>Loading messages...</span>
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
        </OutletLayout >
    );
};


export default Chat;
