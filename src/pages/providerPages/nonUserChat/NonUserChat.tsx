import Button from '../../../components/button/Button'
import { NavLink, useParams } from 'react-router-dom'
import NonUserChatMessages from '../../../components/pagesComponent/chat/chatMessages/NonUserChatMessages'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import messageApiService from '../../../apiServices/chatApi/messagesApi/MessagesApi'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import { Message } from '../../../types/chatType/ChatType'


const NonUserChat = () => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
    const { id, type } = useParams(); // This gives you the dynamic ID from the URL

    // React Query to fetch messages for the active chat
    const { data: allMessage } = useQuery<Message[]>({
        queryKey: ['messages', id],
        queryFn: async () => {
            if (!id) {
                toast.error("Chat channel ID is missing.");
                return;
            }
            const dataSendToBack = { loginUserId, chatChannelId: id };
            try {
                const response = await messageApiService.getAllMessagesOfSingleChatChannel(dataSendToBack);
                return response?.data?.messages;
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        },
        enabled: !!id && type === 'individual',
    });
    // React Query to fetch messages for the active group chat
    const { data: allGroupMessage } = useQuery<Message[]>({
        queryKey: ['groupmessages', id],
        queryFn: async () => {
            if (!id) {
                toast.error("Group channel ID is missing.");
                return;
            }
            const dataSendToBack = { loginUserId, groupId: id };
            console.log("dataSendToBack", dataSendToBack);

            try {
                const response = await messageApiService.getAllMessagesOfGroupChatChannel(dataSendToBack);
                return response?.data?.groupMessages;
            } catch (error) {
                console.error('Error fetching messages:', error);
                return [];
            }
        },
        enabled: !!id && type === 'group',
    });

    const selectedMessages = type === 'group' ? allGroupMessage : allMessage;

    console.log("all messages for non user", selectedMessages);

    return (<>
        <div className='p-4 flex items-center justify-between'>
            <p>Logo</p>

            <div className='w-[160px] sm:w-[210px] flex items-center gap-x-3'>
                <NavLink to="/" className='w-[80px] sm:w-[100px]'>
                    <Button text='Login' borderButton />
                </NavLink>
                <NavLink to="/client-signup" className='w-[80px] sm:w-[100px]'>
                    <Button text='Signup' />
                </NavLink >
            </div>

        </div>
        <div className='bg-inputBgColor min-h-[90vh] flex items-center justify-center'>
            <div className='w-[90%] md:w-[60%] bg-white m-auto mt-4 p-4 rounded-md min-h-[86vh] max-h-[86vh] overflow-auto'>
                <NonUserChatMessages messageData={selectedMessages || []} />
            </div>
        </div>
    </>
    )
}

export default NonUserChat