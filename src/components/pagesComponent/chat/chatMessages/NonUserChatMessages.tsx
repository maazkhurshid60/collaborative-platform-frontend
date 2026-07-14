import { useEffect, useRef } from 'react';
import UserIcon from '../../../icons/user/User';

interface Message {
    id: string;
    senderId: string;
    message: string;
    chatChannelId: string;
    createdAt: string;
    mediaUrl?: string;
    type?: string;
    sender: {
        fullName: string;
        profileImage?: string | null;
    };
    you?: boolean;
}

interface NonUserChatMessagesProps {
    messageData: Message[];
}

const NonUserChatMessages: React.FC<NonUserChatMessagesProps> = ({ messageData }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
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
                                {!msg.you && (
                                    <>
                                        {(msg?.sender?.profileImage !== null && msg?.sender?.profileImage !== "null") ?
                                            <img className='w-10 h-10 rounded-full object-cover' src={msg?.sender?.profileImage} />
                                            : <UserIcon size={30} />
                                        }
                                    </>
                                )}
                                <div className={`max-w-[75%] flex flex-col ${msg.you ? 'items-end' : ''}`}>
                                    <p className="font-semibold mb-2">
                                        {msg?.you ? 'You' : msg?.sender?.fullName}
                                    </p>
                                    <div className="flex items-center gap-x-4 text-[14px]">
                                        <div className="flex flex-col gap-2 relative">
                                            {msg.mediaUrl && (
                                                <div className="flex flex-col gap-2 mt-1">
                                                    {msg.mediaUrl.split(',').map((url, index) => {
                                                        const extension = url.split('.').pop()?.toLowerCase();
                                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
                                                        const isPdf = extension === 'pdf';
                                                        const isDoc = ['doc', 'docx'].includes(extension || '');

                                                        return (
                                                            <div key={index} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                                                {isImage ? (
                                                                    <img src={url} alt="media" className="w-32 h-auto rounded-md object-cover border border-gray-300" />
                                                                ) : (
                                                                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xl">
                                                                        {isPdf ? '📄' : isDoc ? '📝' : '📎'}
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col justify-center">
                                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline text-sm">
                                                                        {isImage ? 'View Image' : isPdf ? 'View PDF' : isDoc ? 'Open Document' : 'Download File'}
                                                                    </a>
                                                                    <p className="text-xs text-gray-400 mt-1">.{extension?.toUpperCase()}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {msg.message && (
                                                <p className={`p-4 rounded-lg max-w-xs break-all ${msg?.you ? 'bg-primaryColorDark text-white' : 'bg-[#EAF5F4] text-textGreyColor'}`}>
                                                    {msg.message}
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-textGreyColor text-[12px]">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
