import { useEffect, useRef } from 'react';
import UserIcon from '../../../icons/user/User';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on any messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageData]);

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

    return (
        <div className="bg-white p-3 rounded-lg h-full flex flex-col">
            <hr className="my-4 border-inputBgColor" />

            <div className="flex-1 overflow-y-auto mb-4 relative">
                {messageData.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">No messages yet</div>
                )}
                {Object.entries(groupMessagesByDate(messageData)).map(([dateGroup, groupMsgs]) => (
                    <div key={dateGroup}>
                        {/* Sticky Date Header */}
                        <div className="w-full">
                            <div className="sticky top-0 z-20 bg-white py-2 font-[Poppins] text-lg text-gray-500">
                                {dateGroup}
                            </div>
                        </div>

                        {groupMsgs.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex items-start mb-6 ${msg.you ? 'justify-end' : ''} gap-x-4`}
                            >
                                {!msg.you && <UserIcon size={30} />}
                                <div className={`max-w-[75%] flex flex-col ${msg.you ? 'items-end' : ''}`}>
                                    <p className="font-semibold mb-2">
                                        {msg?.you ? 'You' : msg?.sender?.user?.fullName}
                                    </p>
                                    <div className="flex items-center gap-x-4 text-[14px]">
                                        <p
                                            className={`p-4 break-all rounded-lg ${msg?.you ? 'bg-primaryColorDark text-white' : 'bg-[#EAF5F4] text-textGreyColor'}`}
                                        >
                                            {msg?.message}
                                        </p>
                                        <p className="text-textGreyColor text-[12px]">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                {msg.you && <UserIcon size={30} />}
                            </div>
                        ))}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <hr className="my-4 border-inputBgColor" />
        </div>
    );
};

export default NonUserChatMessages;
