import { useEffect, useRef, useState } from 'react';
import { GrAttachment } from "react-icons/gr";
import { IoIosSend } from "react-icons/io";
import UserIcon from '../../../icons/user/User';
import { RootState } from '../../../../redux/store';
import { useSelector } from 'react-redux';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';
import { getSocket } from '../../../../socket/Socket';  // Corrected import
import ChatNavbar from './ChatNavbar';
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType';




interface Message {
    id: string;
    senderId: string;
    message: string;
    chatChannelId: string;
    createdAt: string;
    sender: {
        user: { fullName: string };
    };
    you?: boolean;
}



interface ChatMessagesProps {
    messageData: Message[];
    activeChatObject: ChatChannelType;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messageData, activeChatObject }) => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
    const [sendMessageText, setSendMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    console.log("<<<<messageDatanon user<<<<<", messageData);

    // Load initial messages whenever `messageData` changes
    useEffect(() => {
        if (messageData) {
            setMessages(
                messageData?.map(msg => ({
                    ...msg,
                    you: msg.senderId === loginUserId,
                }))
            );
        } else {
            setMessages([]);
        }
    }, [messageData, loginUserId]);

    // Listen for incoming socket messages once
    useEffect(() => {
        const socket = getSocket();

        if (!socket || !activeChatObject) return;

        const handleIncoming = (newMsg: Message) => {
            if (newMsg.chatChannelId === activeChatObject.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, { ...newMsg, you: newMsg.senderId === loginUserId }];
                });
            }
        };

        // const handleIncoming = (newMsg: Message) => {
        //     if (newMsg.chatChannelId === activeChatObject.id) {
        //         setMessages(prev => {
        //             const isDuplicate = prev.some(
        //                 m =>
        //                     m.id === newMsg.id ||
        //                     (m.message === newMsg.message &&
        //                      m.senderId === newMsg.senderId &&
        //                      m.createdAt === newMsg.createdAt)
        //             );
        //             if (isDuplicate) return prev;

        //             return [...prev, { ...newMsg, you: newMsg.senderId === loginUserId }];
        //         });
        //     }
        // };
        socket.on('receive_direct', handleIncoming);

        return () => {
            socket.off('receive_direct', handleIncoming); // Cleanup the event listener
        };
    }, [activeChatObject, loginUserId]);

    // Auto-scroll to bottom on any messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message: API → then socket emit
    const sendMessage = async () => {
        if (!sendMessageText.trim() || !activeChatObject) return;

        const payload = {
            message: sendMessageText,
            chatChannelId: activeChatObject.id,
            mediaUrl: '',
            type: 'text',
            senderId: loginUserId,
        };


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
            const res = await messageApiService.sendMessageToSingleConservation(payload);
            const saved: Message = res.data.chatMessage;

            // Replace temp with saved
            setMessages(prev =>
                prev.map(m => (m.id === tempId ? { ...saved, you: true } : m))
            );

            // Emit to other
            const otherId =
                activeChatObject.providerA.id === loginUserId
                    ? activeChatObject.providerB.id
                    : activeChatObject.providerA.id;

            const socket = getSocket();
            if (socket && socket.connected) {
                socket.emit('send_direct', {
                    toProviderId: otherId,
                    content: saved.message,
                    chatChannelId: saved.chatChannelId,
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove temp message
        }
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return isNaN(d.getTime())
            ? ''
            : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!activeChatObject) {
        return <div className="p-4 text-center">Select a conversation to start chatting</div>;
    }


    const otherName =
        activeChatObject?.providerA?.id === loginUserId
            ? activeChatObject?.providerB?.user?.fullName
            : activeChatObject?.providerA?.user?.fullName;

    return (



        <div className="bg-white p-3 rounded-lg h-full flex flex-col">
            <ChatNavbar name={otherName} />
            <hr className="my-4 border-inputBgColor" />

            <div className="flex-1 overflow-y-auto mb-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">No messages yet</div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start mb-6 ${msg.you ? 'justify-end' : ''
                            } gap-x-4`}
                    >
                        {!msg.you && <UserIcon size={30} />}
                        <div className={`max-w-[75%] flex flex-col ${msg.you ? 'items-end' : ''}`}>
                            <p className="font-semibold mb-2">{msg?.you ? 'You' : msg?.sender?.user?.fullName}</p>
                            <div className="flex items-center gap-x-4 text-[14px]">
                                <p
                                    className={`p-4 rounded-lg ${msg?.you ? 'bg-primaryColorDark text-white' : 'bg-[#EAF5F4] text-textGreyColor'
                                        }`}
                                >
                                    {msg?.message}
                                </p>
                                <p className="text-textGreyColor text-[12px]">{formatTime(msg?.createdAt)}</p>
                            </div>
                        </div>
                        {msg.you && <UserIcon size={30} />}
                    </div>

                ))}
                <div ref={messagesEndRef} />
            </div >

            <hr className="my-4 border-inputBgColor" />

            <div className="flex items-center justify-between">
                <input
                    className="outline-none pl-4 py-2 w-[70%] bg-white border rounded-lg"
                    placeholder="Type your message..."
                    value={sendMessageText}
                    onChange={e => setSendMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                />
                <div className="flex items-center gap-x-4 p-2">
                    <GrAttachment size={20} className="cursor-pointer" />
                    <button
                        className="h-[38px] w-[38px] bg-primaryColorDark rounded-full flex items-center justify-center text-white"
                        onClick={sendMessage}
                    >
                        <IoIosSend size={24} />
                    </button>
                </div>
            </div>
        </div >
    );
};


export default ChatMessages;
