import { useEffect, useRef, useState } from 'react';

import UserIcon from '../../../icons/user/User';
import { RootState } from '../../../../redux/store';
import { useSelector } from 'react-redux';




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



interface NonUserChatMessagesProps {
    messageData: Message[];
}

const NonUserChatMessages: React.FC<NonUserChatMessagesProps> = ({ messageData }) => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
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



    // Auto-scroll to bottom on any messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);



    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return isNaN(d.getTime())
            ? ''
            : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };




    return (



        <div className="bg-white p-3 rounded-lg h-full flex flex-col">
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
            </div>

            <hr className="my-4 border-inputBgColor" />


        </div>
    );
};

export default NonUserChatMessages;
