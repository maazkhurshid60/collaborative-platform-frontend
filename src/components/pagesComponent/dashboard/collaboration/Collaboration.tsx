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

import SpinnerLoader from '../../../loader/SpinnerLoader';

const Collaboration = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchText, setSearchText] = useState('');
    const tabs = ["Chats", "Groups"];

    const loginUserProviderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
    const loginUserUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId);
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id);

    const [activeId, setActiveId] = useState<string>();

    const queryClient = useQueryClient();
    const socket = getSocket();

    useEffect(() => {
        if (loginUserProviderId) initSocket(loginUserProviderId, "");
    }, [loginUserProviderId]);

    const { data: allChannels = [] } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserProviderId);
            return res.data.findAllChatChannel;
        },
        enabled: !!loginUserProviderId,
        staleTime: 30 * 1000, // prevent badge flicker from background refetch
    });

    const { data: allGroups = [], isLoading: isGroupLoading } = useQuery({
        queryKey: ['groupChatchannels'],
        queryFn: async () => {
            try {
                const res = await chatApiService.getGroupChatChannels(loginUserUserId);
                return res?.data?.allgroups || [];
            } catch (error) {
                console.error("Error fetching group chat channels:", error);
                return [];
            }
        },
        enabled: !!loginUserUserId,
        staleTime: 30 * 1000, // prevent badge flicker from background refetch
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
            ?.sort((a: ChatChannelType, b: ChatChannelType) => {
                const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
                const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
                return bTime - aTime;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allChannels, providerData, loginUserProviderId]);


    const filteredChats = searchText
        ? unBlockProviders?.filter((channel: ChatChannelType) => {
            const recipient = channel?.providerAId === loginUserUserId ? channel?.providerB : channel?.providerA;
            const name = recipient?.fullName || '';
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


    // Join all group socket rooms so we receive group messages
    useEffect(() => {
        if (!loginUserProviderId || !allGroups?.length) return;

        const socket = getSocket();
        if (!socket) return;

        const joinAllGroupRooms = () => {
            allGroups.forEach((group: GroupChat) => {
                socket.emit('join_channel', { chatChannelId: group.id });
            });
        };

        if (socket.connected) {
            joinAllGroupRooms();
        } else {
            socket.on('connect', joinAllGroupRooms);
        }

        return () => {
            socket.off('connect', joinAllGroupRooms);
        };
    }, [loginUserProviderId, allGroups]);

    useEffect(() => {
        if (!socket || !loginUserProviderId) return;

        const handleNewDirectMessage = (newMessage: Message) => {
            queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], (oldData) => {
                if (!oldData) return [];
                return oldData.map(channel => {
                    if (channel.id === newMessage.chatChannelId) {
                        return {
                            ...channel,
                            totalUnread: (Number(channel.totalUnread) || 0) + 1,
                            lastMessage: newMessage,
                        };
                    }
                    return channel;
                });
            });
        };

        const handleNewGroupMessage = (newMessage: Message) => {
            const isFromSelf = newMessage.senderId === loginUserUserId;
            if (isFromSelf) return; // don't increment for own messages

            queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], (oldData = []) => {
                return oldData.map(group => {
                    if (group.id === newMessage.groupId) {
                        return {
                            ...group,
                            unreadCount: (Number(group.unreadCount) || 0) + 1,
                            lastMessage: {
                                id: newMessage.id,
                                message: newMessage.message || '📎 File',
                                createdAt: newMessage.createdAt || new Date().toISOString(),
                                mediaUrl: newMessage.mediaUrl,
                                type: newMessage.type,
                            },
                        };
                    }
                    return group;
                });
            });
        };

        socket.on('new_message', handleNewDirectMessage);
        socket.on('receive_direct', handleNewDirectMessage);
        socket.on('receive_group', handleNewGroupMessage);

        return () => {
            socket.off('new_message', handleNewDirectMessage);
            socket.off('receive_direct', handleNewDirectMessage);
            socket.off('receive_group', handleNewGroupMessage);
        };
    }, [socket, loginUserProviderId, loginUserUserId, queryClient]);

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
        <>
            <div className='mt-3 h-fit overflow-y-auto'>
                <SearchBar
                    sm
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={'Search here...'}
                    bgColor={"bg-inputBgColor"}
                />
            </div>

            <div className='flex items-center mt-3'>
                {tabs.map((tab, id) => (
                    <p
                        key={id}
                        className={`w-1/2 
                             font-medium 
                             cursor-pointer
                             text-center
                             transition-colors
                             duration-300 ${activeTab === id ? 'text-primaryColorDark' : 'text-gray-500'}`}
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
                    <div className="min-h-screen overflow-y-auto p lg:p-0  mt-4">
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
                                                loginUserId: loginUserProviderId,
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
                    isGroupLoading ? (
                        <div className="flex justify-center mt-10">
                            <SpinnerLoader text="Loading groups..." />
                        </div>
                    ) : filteredGroups?.length === 0 ? (
                        <NoRecordFound />
                    ) : (
                        filteredGroups.map((data: GroupChat) => (
                            <div className="gap-y-2" key={data?.id}>
                                <Groups
                                    data={data}
                                    activeId={activeId}
                                    onClick={() => {
                                        setActiveId(data?.id);
                                        if (socket?.connected && data?.id) {
                                            socket.emit('join_channel', { chatChannelId: data.id });
                                        }
                                        messageApiService.readMessageGroupConservation({
                                            loginUserId: loginUserProviderId,
                                            groupId: data?.id,
                                        }).then(() => {
                                            queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], oldData => {
                                                if (!oldData) return oldData;
                                                return oldData.map(group =>
                                                    group.id === data.id
                                                        ? { ...group, unreadCount: 0 }
                                                        : group
                                                );
                                            });
                                        }).catch((err) => {
                                            console.error('Failed to mark group messages as read', err);
                                        });
                                    }}
                                />
                            </div>
                        ))
                    )
                )}
            </div>
        </>
    );
};

export default Collaboration;
