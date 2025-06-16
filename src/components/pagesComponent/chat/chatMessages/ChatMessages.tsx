import { useEffect, useRef, useState } from 'react';
import { GrAttachment } from "react-icons/gr";
import { IoIosSend } from "react-icons/io";
import UserIcon from '../../../icons/user/User';
import { RootState } from '../../../../redux/store';
import { useSelector } from 'react-redux';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';
import { getSocket, initSocket } from '../../../../socket/Socket';  // Corrected import
import ChatNavbar from './ChatNavbar';
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType';
import { toast } from 'react-toastify';
import { GroupChat, GroupMember } from '../../../../types/chatType/GroupType';
import "./chat.css"



interface Message {
    id: string;
    senderId: string;
    groupId?: string | null;
    message: string;
    chatChannelId: string;
    createdAt: string;
    sender: {
        user: { fullName: string, profileImage?: string | null };
    };
    you?: boolean;
}


interface ChatMessagesProps {
    messageData: Message[];
    activeChatObject: ChatChannelType | GroupChat;
    activeChatType?: 'individual' | 'group';
}
const ChatMessages: React.FC<ChatMessagesProps> = ({ messageData, activeChatObject, activeChatType }) => {

    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);
    const [sendMessageText, setSendMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();
    // Load initial messages whenever `messageData` changes
    useEffect(() => {
        if (messageData) {
            setMessages(
                messageData?.map(msg => ({
                    ...msg,
                    you: msg?.senderId === loginUserId,
                }))
            );
        } else {
            setMessages([]);
        }
    }, [messageData, loginUserId]);



    useEffect(() => {

        if (!socket || !activeChatObject) return;

        const handleIncoming = (newMsg: Message) => {
            setMessages(prev => {
                // Step 1: If temp message exists, replace it
                const tempIndex = prev.findIndex(
                    m => m.id.startsWith("temp") && m.message === newMsg.message && m.senderId === newMsg.senderId
                );
                if (tempIndex !== -1) {
                    const updated = [...prev];
                    updated[tempIndex] = { ...newMsg, you: newMsg.senderId === loginUserId };
                    return updated;
                }

                // Step 2: If message already exists by ID, skip it
                if (prev.some(m => m.id === newMsg.id)) return prev;

                // Step 3: Add new message
                return [...prev, { ...newMsg, you: newMsg.senderId === loginUserId }];
            });
        };


        socket.off('receive_direct');
        socket.off('receive_group');

        if (activeChatType === 'individual') {

            socket.on('receive_direct', handleIncoming);
        } else if (activeChatType === 'group') {

            socket.on('receive_group', handleIncoming);
        }

        return () => {
            socket.off('receive_direct', handleIncoming);
            socket.off('receive_group', handleIncoming);
        };
    }, [activeChatObject?.id, activeChatType]);



    // Auto-scroll to bottom on any messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message: API → then socket emit
    const sendMessage = async () => {
        if (!sendMessageText.trim() || !activeChatObject) return;




        // Optimistically append with a temp ID
        const tempId = `temp-${Date.now()}`;
        const tempMsg: Message = {
            id: tempId,
            senderId: loginUserId,
            message: sendMessageText,
            chatChannelId: activeChatObject.id,
            createdAt: new Date().toISOString(),
            sender: { user: { fullName: 'You' } },
            you: true,
        };
        setMessages(prev => [...prev, tempMsg]);
        setSendMessageText('');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        try {
            if (activeChatType === "individual") {
                const singlePayload = {
                    message: sendMessageText,
                    chatChannelId: activeChatObject.id,
                    mediaUrl: '',
                    type: 'text',
                    senderId: loginUserId,
                };
                const res = await messageApiService.sendMessageToSingleConservation(singlePayload);
                const saved: Message = res.data.chatMessage;

                // Replace temp with saved
                setMessages(prev =>
                    prev.map(m => (m.id === tempId ? { ...saved, you: true } : m))
                );
                // Emit to other
                const otherId =
                    activeChatObject?.providerA.id === loginUserId
                        ? activeChatObject.providerB.id
                        : activeChatObject.providerA.id;



                setMessages(prev =>
                    prev.map(m => (m.id === tempId ? { ...saved, you: true } : m))
                );

                // Send full saved message to backend
                // const socket = getSocket();
                console.log("<<<<<<<<<<<<<<<socket", socket, socket?.connected);
                console.log("<<<<<<<<<<<<<<<otherId, saved", otherId, saved);


                if (!socket?.connected) {
                    socket?.once('connect', () => {
                        socket.emit("send_direct", { toProviderId: otherId, message: saved });
                    });
                } else {
                    socket.emit("send_direct", { toProviderId: otherId, message: saved });
                }



            } else {

                const groupPayload = {
                    message: sendMessageText,
                    groupId: activeChatObject.id,
                    mediaUrl: '',
                    type: 'text',
                    senderId: loginUserId,
                };

                const res = await messageApiService.sendMessagesOfGroupChatChannel(groupPayload);
                const saved: Message = res.data.chatMessage;

                // const socket = getSocket();
                if (socket && socket.connected) {
                    socket.emit('send_group', {
                        message: saved, // ✅ send full saved message
                    });
                }

            }



        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove temp message
        }
    };


    useEffect(() => {
        const soc = getSocket()
        console.log(soc);


        if (socket && activeChatObject?.id) {
            socket.emit('join_channel', { chatChannelId: activeChatObject.id });
            console.log("✅ Joined chat channel:", activeChatObject.id);
        }
    }, [activeChatObject?.id]);
    useEffect(() => {
        if (!socket && loginUserId) {
            initSocket(loginUserId);
        }
    }, [loginUserId]);


    if (!activeChatObject) {
        return <div className="p-4 text-center">Select a conversation to start chatting</div>;
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
                return 'Today';
            } else if (
                date.getDate() === yesterday.getDate() &&
                date.getMonth() === yesterday.getMonth() &&
                date.getFullYear() === yesterday.getFullYear()
            ) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }); // e.g., Monday, 6 May 2025
            }
        };

        for (const msg of messages) {
            const key = getGroupKey(msg.createdAt);
            if (!groups[key]) groups[key] = [];
            groups[key].push(msg);
        }

        return groups;
    };


    const otherName = activeChatObject?.name ? activeChatObject?.name :
        activeChatObject?.providerA?.id === loginUserId
            ? activeChatObject?.providerB?.user?.fullName
            : activeChatObject?.providerA?.user?.fullName;



    return (



        <div className="bg-white p-3 rounded-lg h-full flex flex-col">
            <ChatNavbar
                name={otherName}
                groupMembers={(activeChatObject?.members as GroupMember[]) ?? []}
            />            <hr className="my-4 border-inputBgColor" />

            <div className="flex-1 overflow-y-auto mb-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">No messages yet</div>
                )}
                {Object.entries(groupMessagesByDate(messages)).map(([dateGroup, groupMsgs]) => (
                    <div key={dateGroup}>
                        <div className="sticky top-0 z-10 bg-white py-2 font-[Poppins] text-lg text-gray-500">
                            {dateGroup}
                        </div>
                        {groupMsgs.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex items-start mb-6 ${msg.you ? 'justify-end' : ''} gap-x-4`}
                            >



                                {!msg.you &&
                                    <>
                                        {(msg?.sender?.user?.profileImage !== null && msg?.sender?.user?.profileImage !== "null") ?
                                            // <img className='w-10 h-10 rounded-full object-cover' src={`${localhostBaseUrl}uploads/eSignatures/${msg?.sender?.user?.profileImage?.split('/').pop()}`} />
                                            <img className='w-10 h-10 rounded-full object-fill' src={msg?.sender?.user?.profileImage} />


                                            : <UserIcon size={30} />}


                                    </>}

                                <div className={`max-w-[75%] flex flex-col ${msg.you ? 'items-end' : ''}`}>
                                    <p className="font-semibold mb-2 capitalize">
                                        {msg?.you ? 'You' : msg?.sender?.user?.fullName}
                                    </p>
                                    <div className="flex items-center gap-x-4 text-[14px]">
                                        {msg?.you && <p className="text-textGreyColor text-[12px]">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                        </p>}
                                        {/* <p className={`p-4 rounded-lg ${msg?.you ? 'bg-primaryColorDark text-white' : 'bg-[#EAF5F4] text-textGreyColor'}`}>
                                            {msg?.message}
                                        </p> */}
                                        <p className={`relative p-4 rounded-lg max-w-xs 
                                         ${msg?.you
                                                ? 'bg-primaryColorDark text-white bubble-right'
                                                : 'bg-[#EAF5F4] text-textGreyColor bubble-left'}
                                        `}>
                                            {msg?.message}
                                        </p>


                                        {!msg?.you && <p className="text-textGreyColor text-[12px]">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                        </p>}
                                    </div>
                                </div>
                                {msg.you && <>  {(msg?.sender?.user?.profileImage !== null && msg?.sender?.user?.profileImage !== "null") ?
                                    // <img className='w-10 h-10 rounded-full object-cover' src={`${localhostBaseUrl}uploads/eSignatures/${msg?.sender?.user?.profileImage?.split('/').pop()}`} />
                                    <img className='w-10 h-10 rounded-full object-fill' src={msg?.sender?.user?.profileImage} />


                                    : <UserIcon size={30} />}
                                </>
                                }
                            </div>
                        ))}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div >

            <hr className="my-4 border-inputBgColor" />

            <div className="flex items-center justify-between">
                <input
                    className="outline-none pl-4 py-2 w-[70%] bg-white  rounded-lg"
                    placeholder="Type here..."
                    value={sendMessageText}
                    onChange={e => setSendMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                />
                <div className="flex items-center gap-x-4 p-2">
                    <GrAttachment size={20} className="cursor-pointer" onClick={() => toast.success("This feature comming soon")} />
                    <button
                        className="h-[38px] w-[38px] bg-primaryColorDark rounded-full flex items-center justify-center text-white"
                        onClick={sendMessage}
                    >
                        <IoIosSend size={24} className='cursor-pointer' />
                    </button>
                </div>
            </div>
        </div >
    );
};


export default ChatMessages;
