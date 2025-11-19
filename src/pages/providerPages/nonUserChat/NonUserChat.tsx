import { useEffect, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {  useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../../../redux/store';
import messageApiService from '../../../apiServices/chatApi/messagesApi/MessagesApi';
import { Message } from '../../../types/chatType/ChatType';
import Button from '../../../components/button/Button';
import NonUserChatMessages from '../../../components/pagesComponent/chat/chatMessages/NonUserChatMessages';
// import { addDataNewJoinUserReducer } from '../../../redux/slices/JoinNowUserSlice';
import logo from "../../../../public/assets/kolabme-logo.svg";
import Loader from '../../../components/loader/Loader';

const NonUserChat = () => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
    const { id, type } = useParams();
    const isLoading = false;

    const messageContainerRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    // const dispatch = useDispatch()
    // const naviagte = useNavigate()
    const fetchMessages = async (currentPage = 1) => {
        if (!id || !loginUserId) return;

        const container = messageContainerRef.current;
        const oldScrollHeight = container?.scrollHeight || 0;

        setLoading(true);

        const payload = {
            loginUserId,
            page: currentPage,
            limit: 10,
            ...(type === 'group' ? { groupId: id } : { chatChannelId: id })
        };

        try {
            const response = type === 'group'
                ? await messageApiService.getAllMessagesOfGroupChatChannel(payload)
                : await messageApiService.getAllMessagesOfSingleChatChannel(payload);

            const newMessages = (type === 'group'
                ? response?.data?.groupMessages
                : response?.data?.messages) || [];

            setMessages(prev => [
                ...newMessages.map((m: Message) => ({ ...m, you: m.senderId === loginUserId })),
                ...prev,
            ]);

            setPage(currentPage);
            setHasMore(response?.data?.hasMore);

            setTimeout(() => {
                const newScrollHeight = container?.scrollHeight || 0;
                if (container) {
                    container.scrollTop = newScrollHeight - oldScrollHeight;
                }
            }, 100);
        } catch (err) {
            console.error('❌ Error fetching messages:', err);
            toast.error('Error loading messages.');
        }

        setLoading(false);
    };

    // const joinChatFun = async () => {
    //     setIsLoading(true)
    //     const dataSendToBack = {
    //         groupId: id, memberEmail: email
    //     }
    //     console.log("data send to joint chat", dataSendToBack);
    //     try {
    //         const response = await messageApiService.updateGroupApi(dataSendToBack)

    //         console.log(response);
    //         toast.success('You have joined the gourp. Please login yourself and go chat for more information.')
    //         naviagte("/")
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     } catch (err: any) {
    //         console.error('❌:', err);
    //         const errorMessage = typeof err === "string"
    //             ? err
    //             : err?.message || 'Error loading messages.';

    //         toast.error(errorMessage);
    //         // If error contains a specific message, show it in the toast

    //         if (errorMessage === "Member is already part of this group.") {
    //             naviagte("/");
    //         } else {

    //             const newJoinDataSendToBack = { ...dataSendToBack, isNewJoin: true }

    //             dispatch(addDataNewJoinUserReducer(newJoinDataSendToBack))
    //             naviagte("/provider-signup")
    //         }

    //     }


    //     setLoading(false);

    // }

    useEffect(() => {
        setMessages([]); // reset when chat changes
        setPage(1);
        setHasMore(true);
        fetchMessages(1);
    }, [id, type]);

    useEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop === 0 && hasMore && !loading) {
                fetchMessages(page + 1);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, loading]);

    return (
        <>
            {isLoading && <Loader />}
            <div className='p-4 flex items-center justify-between'>
                <img src={logo} alt="logo" className="w-[50px] md:w-[70px] lg:w-auto" />

                {type === "group" ?
                    // <p onClick={joinChatFun} className='w-[80px] sm:w-[100px]'>
                    //     <Button text='Join Now' />
                    // </p>
                     <div className='w-[160px] sm:w-[210px] flex items-center gap-x-3'>
                            <NavLink to="/" className='w-[80px] sm:w-[100px]'>
                                <Button text='Login' borderButton />
                            </NavLink>
                            <NavLink to="/client-signup" className='w-[80px] sm:w-[100px]'>
                                <Button text='Signup' />
                            </NavLink>
                        </div>
                    : <>
                        <div className='w-[160px] sm:w-[210px] flex items-center gap-x-3'>
                            <NavLink to="/" className='w-[80px] sm:w-[100px]'>
                                <Button text='Login' borderButton />
                            </NavLink>
                            <NavLink to="/provider-signup" className='w-[80px] sm:w-[100px]'>
                                <Button text='Signup' />
                            </NavLink>
                        </div>
                    </>}


            </div>

            <div className='bg-inputBgColor min-h-[90vh] flex items-center justify-center'>
                <div className='w-[90%] md:w-[60%] bg-white m-auto mt-4 p-4 rounded-md min-h-[86vh] max-h-[86vh] overflow-auto' ref={messageContainerRef}>
                    {loading && (
                        <div className="text-center text-gray-400 text-sm py-2">Loading messages...</div>
                    )}
                    <NonUserChatMessages messageData={messages} />
                </div>
            </div>
        </>
    );
};

export default NonUserChat;
