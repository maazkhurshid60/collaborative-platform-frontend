import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import chatApiService from '../../../apiServices/chatApi/ChatApi';
import messageApiService from '../../../apiServices/chatApi/messagesApi/MessagesApi';
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
import AddIcon from '../../../components/icons/add/Add';
import NewGroupChatModal from '../../../components/modals/providerModal/chatModal/NewGroupChatModal';



interface NewMessage {
    chatChannelId?: string
    id?: string
}
export interface Message {
    id: string;
    message: string;
    type: string;
    mediaUrl: string;
    chatChannelId: string;
    groupId: string | null;
    senderId: string;
    createdAt: string;
    readStatus: 'read' | 'unread';
    readReceipts: string[]; // Define more precisely if needed

    sender: {
        id: string;
        email: string;
        password: string;
        department: string;
        createdAt: string;
        updatedAt: string;
        userId: string;

        user: {
            id: string;
            fullName: string;
            age: number;
            gender: string;
            cnic: string;
            contactNo: string;
            address: string;
            role: string;
            status: string;
            profileImage: string | null;
            createdAt: string;
            updatedAt: string;
            blockedMembers: string[]; // Define type if available
        };
    };
}

const Chat = () => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
    const isNewChatModal = useSelector((state: RootState) => state.modalSlice.isNewChatModal);
    const isNewGroupChatModal = useSelector((state: RootState) => state.modalSlice.isNewGroupChatModal);
    const isModalShow = useSelector((state: RootState) => state.modalSlice.isModalShow);
    const [activeChatObject, setActiveChatObject] = useState<ChatChannelType | undefined>(undefined);
    const [isChatSideBarClose, setIsChatSideBarClose] = useState<boolean>(false);
    const [activeId, setActiveId] = useState<string>()
    const queryClient = useQueryClient();
    const dispatch = useDispatch<AppDispatch>()
    const socket = getSocket();

    useEffect(() => {
        if (loginUserId) {
            initSocket(loginUserId);
        }
    }, [loginUserId]);

    useEffect(() => {
        const handler = (newMessage: NewMessage) => {
            if (newMessage.chatChannelId !== activeChatObject?.id) return;

            queryClient.setQueryData<{ messages: NewMessage[] }>(

                ['messages', activeChatObject?.id],

                old => {
                    console.log("<<<<<old<<old<old<<<<<<<", old);

                    if (!old) return { messages: [newMessage] };
                    if (old.messages.some(m => m.id === newMessage.id)) return old;
                    return { messages: [...old.messages, newMessage] };
                }
            );
        };

        if (activeChatObject?.id && socket) {
            socket.on('receive_direct', handler);
        }

        return () => {
            if (socket) socket.off('receive_direct', handler);
        };
    }, [activeChatObject?.id, queryClient, socket]);

    // GET ALL CHANNELS
    const { data: allChannels = [] } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserId);
            return res.data.findAllChatChannel;
        },
    });

    // React Query to fetch messages for the active chat
    const { data: allMessage } = useQuery<Message[]>({
        queryKey: ['messages', activeChatObject?.id],
        queryFn: async () => {
            if (!activeChatObject?.id) {
                toast.error("Chat channel ID is missing.");
                return;
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
        enabled: !!activeChatObject?.id,
    });


    console.log("<<<<<<<<<<<<<<<<<<<<<", allMessage);



    return (
        <OutletLayout isWhiteColor={false}>
            {isModalShow && <ModalLayout heading="Share this chat by generating a link" modalBodyContent={ChatModalBodyContent()} />}

            {isNewChatModal && <ModalLayout heading="New Chat with" modalBodyContent={<NewChatModal />} />}
            {isNewGroupChatModal && <ModalLayout heading="New Chat Group" modalBodyContent={<NewGroupChatModal />} />}



            <div className="flex items-start lg:justify-between relative h-[80vh]">
                <div
                    className={`w-[100%] border-r-[1px] border-r-solid border-r-inputBgColor p-4 lg:w-[35%] xl:w-[25%] bg-white rounded-[10px] absolute z-30 lg:relative ${isChatSideBarClose ? 'left-0' : '-left-[200%] lg:left-0'}`}
                >
                    <div className='flex items-center justify-between '>

                        <p className="font-medium text-[14px] text-textGreyColor">Recent Chats</p>
                        <AddIcon onClick={() => dispatch(isNewChatModalShowReducser(true))} />
                    </div>
                    <div className="min-h-[34h] max-h-[34vh] bg- p-2 lg:p-0 overflow-auto">
                        {allChannels?.map((data: ChatChannelType) => (
                            <div className="gap-y-3" key={data?.id}>
                                <SingleChatData
                                    data={data}
                                    activeId={activeId}
                                    onClick={() => {
                                        setActiveChatObject(data);
                                        setIsChatSideBarClose(false);
                                        setActiveId(data?.id)
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <hr className="w-[100%] h-[1px] text-inputBgColor" />
                    <div className='flex items-center justify-between '>

                        <p className="mt-4 font-medium text-[14px] p-2 lg:p-0 text-textGreyColor">Group Chats</p>
                        <AddIcon onClick={() => dispatch(isNewGroupChatModalShowReducser(true))} />

                    </div>

                    <div className="min-h-[34vh] max-h-[34vh] bg- p-2 lg:p-0 overflow-auto">{/* Group Chats here */}</div>
                </div>

                <div className="w-[100%] lg:w-[65%] xl:w-[74.5%] bg-white h-[80vh] rounded-[10px]">
                    <IoIosArrowBack
                        size={24}
                        className="mb-2 text-textGreyColor lg:hidden"
                        onClick={() => setIsChatSideBarClose(true)}
                    />
                    {allMessage ? (
                        <ChatMessages messageData={allMessage || []} activeChatObject={activeChatObject!} />
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
                    )}
                </div>
            </div>
        </OutletLayout>
    );
};


export default Chat;
