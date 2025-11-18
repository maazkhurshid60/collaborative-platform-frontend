import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../../../searchBar/SearchBar'
import Groups from './Groups'
import Chats from './Chats'
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType';
import { ProviderType } from '../../../../types/providerType/ProviderType';
import providerApiService from '../../../../apiServices/providerApi/ProviderApi';
import { getSocket, initSocket } from '../../../../socket/Socket';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { GroupChat } from '../../../../types/chatType/GroupType';
import chatApiService from '../../../../apiServices/chatApi/ChatApi';
import NoRecordFound from '../../../noRecordFound/NoRecordFound';
import { Message } from '../../../../types/chatType/ChatType';

const Collaboration = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchText, setSearchText] = useState('');
    const tabs = ["Chats", "Groups"];

    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id);

    const [activeId, setActiveId] = useState<string>();

    const queryClient = useQueryClient();
    const socket = getSocket();

    useEffect(() => {
        if (loginUserId) initSocket(loginUserId, "");
    }, [loginUserId]);

    const { data: allChannels = [] } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserId);
            return res.data.findAllChatChannel;
        },
    });

    // const { data: allGroups = [] } = useQuery({
    //     queryKey: ['groupChatchannels'],
    //     queryFn: async () => {
    //         const res = await chatApiService.getGroupChatChannels(loginUserId);
    //         return res?.data?.allgroups;
    //     },
    // });
    const { data: allGroups = [] } = useQuery({
        queryKey: ['groupChatchannels'],
        queryFn: async () => {
            try {
                const res = await chatApiService.getGroupChatChannels(loginUserId);
                return res?.data?.allgroups || []; // <-- ensure it never returns undefined
            } catch (error) {
                console.error("Error fetching group chat channels:", error);
                return []; // <-- fallback on error
            }
        },
    });

    const { data: providerData } = useQuery<ProviderType[]>({
        queryKey: ["providers"],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllProviders(loginUserDetail);
                return response?.data?.providers;
            } catch (error) {
                console.error("Error fetching providers:", error);
                return [];
            }
        }
    });

    const unBlockProviders = useMemo(() => {
        return allChannels
            ?.filter((channel: ChatChannelType) =>
                providerData?.some(provider => channel?.providerBId === provider?.id)
            )
            ?.sort((a: ChatChannelType, b: ChatChannelType) => {
                const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
                const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
                return bTime - aTime;
            });
    }, [allChannels, providerData]);


    const filteredChats = searchText
        ? unBlockProviders?.filter((channel: ChatChannelType) => {
            const recipient = channel?.providerAId === loginUserId ? channel?.providerB : channel?.providerA;
            const name = recipient?.user?.fullName || '';
            return name.toLowerCase().includes(searchText.toLowerCase());
        })
        : unBlockProviders;

    const filteredGroups = useMemo(() => {
        const groups = searchText
            ? allGroups?.filter((group: GroupChat) =>
                (group?.name || '').toLowerCase().includes(searchText.toLowerCase())
            )
            : allGroups;

        return groups?.sort((a: GroupChat, b: GroupChat) => {
            const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
            const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
            return bTime - aTime;
        }) || [];
    }, [allGroups, searchText]);



    useEffect(() => {
        if (!socket || !loginUserId) return;

        const handleNewMessage = (newMessage: Message) => {
            // Increment totalUnread for the chat channel
            queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], (oldData) => {
                if (!oldData) return [];
                return oldData.map(channel => {
                    if (channel.id === newMessage.chatChannelId) {
                        return {
                            ...channel,
                            totalUnread: (Number(channel.totalUnread) || 0) + 1,
                            lastMessage: newMessage, // Optionally update last message
                        };
                    }
                    return channel;
                });
            });
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, loginUserId]);

    useEffect(() => {
        const socket = getSocket();

        const handleRefreshUnread = () => {
            queryClient.invalidateQueries({ queryKey: ['chatchannels'] });
        };

        socket?.on('refresh_unread', handleRefreshUnread);

        return () => {
            socket?.off('refresh_unread', handleRefreshUnread);
        };
    }, []);


    return (
        <div>
            <div className='mt-4'>
                <SearchBar
                    sm
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={'Search here...'}
                    bgColor={"bg-inputBgColor"}
                />
            </div>

            <div className='flex items-center mt-4'>
                {tabs.map((tab, id) => (
                    <p
                        key={id}
                        className={`w-1/2 font-medium cursor-pointer text-center transition-colors duration-300 ${activeTab === id ? 'text-primaryColorDark' : 'text-gray-500'}`}
                        onClick={() => setActiveTab(id)}
                    >
                        {tab}
                    </p>
                ))}
            </div>

            <div className='relative'>
                <hr className='text-textGreyColor/30 h-[1px] w-full mt-2' />
                <hr
                    className={`text-primaryColorDark h-[1px] w-1/2 mt-2 absolute -top-2 transition-all duration-300 ease-in-out ${activeTab === 0 ? 'left-0' : 'left-1/2'}`}
                />
            </div>

            <div className='mt-4'>
                {activeTab === 0 ? (
                    <div className="min-h-[100vh] max-h-[100vh] p-2 lg:p-0 overflow-auto mt-4">
                        {filteredChats?.length === 0 ? (
                            <NoRecordFound />
                        ) : (
                            filteredChats.map((data: ChatChannelType) => (
                                <div className="gap-y-3" key={data?.id}>
                                    <Chats
                                        data={data}
                                        activeId={activeId}
                                        onClick={() => {
                                            setActiveId(data?.id);
                                            if (socket?.connected && data?.id) {
                                                socket.emit('join_channel', { chatChannelId: data.id });
                                            }
                                            messageApiService.readMessageSingleConservation({
                                                loginUserId,
                                                chatChannelId: data.id,
                                            }).then(() => {
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
                            ))
                        )}
                    </div>
                ) : (
                    filteredGroups?.length === 0 ? <NoRecordFound /> : filteredGroups.map((data: GroupChat) => (
                        <div className="gap-y-3" key={data?.id}>
                            <Groups
                                data={data}
                                activeId={activeId}
                                onClick={() => {
                                    setActiveId(data?.id);
                                    if (socket?.connected && data?.id) {
                                        socket.emit('join_channel', { chatChannelId: data.id });
                                    }
                                }}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Collaboration;
