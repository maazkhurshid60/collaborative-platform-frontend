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

const Collaboration = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchText, setSearchText] = useState('');
    const tabs = ["Chats", "Groups"];

    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id);

    // const [activeChatObject, setActiveChatObject] = useState<ChatChannelType | GroupChat | undefined>(undefined);
    const [activeId, setActiveId] = useState<string>();
    // const [activeChatType, setActiveChatType] = useState<'individual' | 'group' | undefined>(undefined);

    const queryClient = useQueryClient();
    const socket = getSocket();

    useEffect(() => {
        if (loginUserId) initSocket(loginUserId);
    }, [loginUserId]);

    const { data: allChannels = [] } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserId);
            return res.data.findAllChatChannel;
        },
    });

    const { data: allGroups = [] } = useQuery({
        queryKey: ['groupChatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getGroupChatChannels(loginUserId);
            return res?.data?.allgroups;
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
                const aTime = new Date(a?.updatedAt)?.getTime();
                const bTime = new Date(b?.updatedAt)?.getTime();
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
    console.log(">>>>>>>>>>>>", filteredChats);

    const filteredGroups = searchText
        ? allGroups?.filter((group: GroupChat) =>
            (group?.name || '').toLowerCase().includes(searchText.toLowerCase())
        )
        : allGroups;

    return (
        <div>
            <div className='mt-4'>
                <SearchBar
                    sm
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder={'Search here...'}
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

            <div className='mt-4 h-[600px] overflow-auto'>
                {activeTab === 0 ? (
                    <div className="min-h-[31vh] max-h-[31vh] p-2 lg:p-0 overflow-auto mt-4">
                        {filteredChats?.length === 0 ? (
                            <NoRecordFound />
                        ) : (
                            filteredChats.map((data: ChatChannelType) => (
                                <div className="gap-y-3" key={data?.id}>
                                    <Chats
                                        data={data}
                                        activeId={activeId}
                                        onClick={() => {
                                            // setActiveChatObject(data);
                                            setActiveId(data?.id);
                                            // setActiveChatType('individual');
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
                                    // setActiveChatObject(data);
                                    setActiveId(data?.id);
                                    // setActiveChatType('group');
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
