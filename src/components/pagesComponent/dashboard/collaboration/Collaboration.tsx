import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../../../searchBar/SearchBar'
import Groups from './Groups'
import Chats from './Chats'
import { IconType } from "react-icons";
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType';
import { ProviderType } from '../../../../types/providerType/ProviderType';
import providerApiService from '../../../../apiServices/providerApi/ProviderApi';
import { disconnectSocket, getSocket, initSocket } from '../../../../socket/Socket';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';
import { Message } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Group, NewMessage } from '../../../../types/chatType/ChatType';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { GroupChat } from '../../../../types/chatType/GroupType';
import chatApiService from '../../../../apiServices/chatApi/ChatApi';
import NoRecordFound from '../../../noRecordFound/NoRecordFound';

export interface ChatDataType {
    img: IconType; // from react-icons
    type: string;
    userName: string;
    message: string;
    totalUnread: number;
}
const Collaboration = () => {
    const [activeTab, setActiveTab] = useState(0)
    const tabs = ["Chats", "Groups"]


    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    const isNewChatModal = useSelector((state: RootState) => state.modalSlice.isNewChatModal);

    const [activeChatObject, setActiveChatObject] = useState<ChatChannelType | GroupChat | undefined>(undefined);
    const [activeId, setActiveId] = useState<string>()
    const [activeChatType, setActiveChatType] = useState<'individual' | 'group' | undefined>(undefined);

    const queryClient = useQueryClient();
    const socket = getSocket();

    useEffect(() => {
        if (loginUserId) {
            initSocket(loginUserId);
        }
    }, [loginUserId]);


    useEffect(() => {
        const handler = (newMessage: NewMessage) => {
            if (newMessage.chatChannelId) {
                queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], oldData => {
                    if (!oldData) return oldData;

                    const updated = oldData.map(channel =>
                        channel.id === newMessage.chatChannelId
                            ? {
                                ...channel,
                                totalUnread: (Number(channel.totalUnread) || 0) + 1,
                                updatedAt: new Date().toISOString(),
                                lastMessage: {
                                    id: newMessage.id!,
                                    message: newMessage?.message || 'New message',
                                    createdAt: new Date().toISOString()
                                }
                            }
                            : channel
                    );

                    return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                });
            }


            queryClient.setQueryData<{ messages: NewMessage[] }>(
                ['messages', activeChatObject?.id],
                old => {
                    if (!old) return { messages: [newMessage] };
                    if (old.messages.some(m => m.id === newMessage.id)) return old;
                    return { messages: [...old.messages, newMessage] };
                }
            );

        };

        const socket = getSocket();
        if (activeChatObject?.id && socket) {
            socket.off('receive_direct', handler); // <=== this prevents multiple bindings
            socket.on('receive_direct', handler);
        }

        return () => {
            if (socket) socket.off('receive_direct', handler);
        };
    }, [activeChatObject?.id]);


    // GET ALL CHANNELS
    const { data: allChannels = [] } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserId);
            return res.data.findAllChatChannel;
        },
    });

    // GET ALL GROUPS
    const { data: allGroups = [] } = useQuery({
        queryKey: ['groupChatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getGroupChatChannels(loginUserId);
            return res?.data?.allgroups;
        },
    });

    useEffect(() => {
        const handler = (newMessage: NewMessage) => {
            if (newMessage.chatChannelId !== activeChatObject?.id) return;

            queryClient.setQueryData<{ messages: NewMessage[] }>(
                ['groupmessages', activeChatObject?.id],
                old => {
                    if (!old) return { messages: [newMessage] };
                    if (old.messages.some(m => m.id === newMessage.id)) return old;
                    return { messages: [...old.messages, newMessage] };
                }
            );
        };

        const socket = getSocket();
        if (activeChatType === 'group' && activeChatObject?.id && socket) {
            socket.off('receive_group', handler); // Ensure no duplicate
            socket.on('receive_group', handler);
        }

        return () => {
            if (socket) socket.off('receive_group', handler);
        };
    }, [activeChatObject?.id, activeChatType, queryClient]);

    console.log("allGroupsallGroups", allGroups);


    useEffect(() => {
        if (!loginUserId || !allGroups.length) return;

        disconnectSocket(); // Ensure no stale socket
        const socket = initSocket(loginUserId);

        const joinAllGroupRooms = () => {
            allGroups.forEach((group: Group) => {
                if (group.id) {
                    // console.log(`📡 Joining group room from frontend: ${group.id}`);
                    socket.emit('join_channel', { chatChannelId: group.id });
                }
            });
        };

        if (socket.connected) {
            joinAllGroupRooms();
        } else {
            socket.on('connect', () => {
                joinAllGroupRooms();
            });
        }
    }, [loginUserId, allGroups]);


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

    console.log("allMessageallMessageallMessageallMessageallMessage", allMessage)





    useEffect(() => {
        if (loginUserId) {
            disconnectSocket(); // Always clear previous socket
            initSocket(loginUserId);
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
    const unBlockProviders = useMemo(() => {
        return allChannels
            ?.filter((channel: ChatChannelType) =>
                providerData?.some(provider => channel?.providerBId === provider?.id)
            )
            ?.sort((a: ChatChannelType, b: ChatChannelType) => {
                const aTime = new Date(a?.updatedAt)?.getTime();
                const bTime = new Date(b?.updatedAt)?.getTime();
                return bTime - aTime;
            });
    }, [allChannels, providerData]);
    console.log("allGroupsallGroupsallGroupsallGroupsallGroupsallGroupsallGroupsallGroupsallGroups", isNewChatModal)




    return (
        <div>
            <div className='mt-4'>
                <SearchBar sm />
            </div>

            <div className='flex items-center mt-4'>
                {tabs.map((tab, id) => (
                    <p
                        key={id}
                        className={`w-1/2 font-medium cursor-pointer text-center transition-colors duration-300 ${activeTab === id ? 'text-primaryColorDark' : 'text-gray-500'
                            }`}
                        onClick={() => setActiveTab(id)}
                    >
                        {tab}
                    </p>
                ))}
            </div>

            <div className='relative'>
                <hr className='text-textGreyColor/30 h-[1px] w-full mt-2' />
                <hr
                    className={`text-primaryColorDark h-[1px] w-1/2 mt-2 absolute -top-2 
                        transition-all duration-300 ease-in-out 
                        ${activeTab === 0 ? 'left-0' : 'left-1/2'}`}
                />
            </div>

            <div className='mt-4 h-[600px] overflow-auto'>

                {activeTab === 0 ?
                    <>
                        <div className="min-h-[31vh] max-h-[31vh] bg- p-2 lg:p-0 overflow-auto mt-4">
                            {unBlockProviders?.length === 0 ? <NoRecordFound /> : unBlockProviders?.map((data: ChatChannelType) => (
                                <div className="gap-y-3" key={data?.id}>
                                    <Chats
                                        data={data}
                                        activeId={activeId}
                                        onClick={() => {
                                            setActiveChatObject(data);
                                            setActiveId(data?.id);
                                            setActiveChatType('individual');

                                            const socket = getSocket();
                                            if (socket?.connected && data?.id) {
                                                socket.emit('join_channel', { chatChannelId: data.id });
                                            }
                                            messageApiService.readMessageSingleConservation({
                                                loginUserId,
                                                chatChannelId: data.id,
                                            }).then(() => {
                                                // Update unread count in cache to 0
                                                queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], oldData => {
                                                    if (!oldData) return oldData;
                                                    return oldData.map(channel =>
                                                        channel.id === data.id
                                                            ? { ...channel, totalUnread: 0 }
                                                            : channel
                                                    );
                                                });
                                            }).catch((err) => {
                                                console.error('Failed to mark messages as read', err);
                                            });
                                        }}

                                    />

                                </div>
                            ))}

                        </div>

                    </>


                    : <>

                        {allGroups?.length === 0 ? <NoRecordFound /> :
                            allGroups?.map((data: GroupChat) => (
                                <div className="gap-y-3" key={data?.id}>
                                    <Groups
                                        data={data}
                                        activeId={activeId}
                                        onClick={() => {
                                            setActiveChatObject(data);
                                            setActiveId(data?.id);
                                            setActiveChatType('group');

                                            if (socket?.connected && data?.id) {
                                                socket.emit('join_channel', { chatChannelId: data.id }); // already used in individual — now works for group too
                                            }
                                        }}
                                    />

                                </div>
                            ))
                        }
                    </>
                }
            </div>
        </div>
    )
}

export default Collaboration
