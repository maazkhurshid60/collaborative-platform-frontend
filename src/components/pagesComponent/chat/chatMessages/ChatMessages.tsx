import { useEffect, useRef, useState } from 'react';
import { IoAttachSharp } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import UserIcon from '../../../icons/user/User';
import { RootState } from '../../../../redux/store';
import { useSelector } from 'react-redux';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';
import { getSocket, initSocket } from '../../../../socket/Socket';  // Corrected import
import ChatNavbar from './ChatNavbar';
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType';
import { GroupChat, GroupMember } from '../../../../types/chatType/GroupType';
import "./chat.css"
import CrossIcon from '../../../icons/cross/Cross';




interface Message {
    id: string;
    senderId: string;
    groupId?: string | null;
    message: string;
    chatChannelId: string;
    mediaUrl?: string
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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const socket = getSocket();
    // Load initial messages whenever `messageData` changes
    useEffect(() => {
        if (Array.isArray(messageData)) {
            setMessages(
                messageData.map(msg => ({
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
                if (prev?.some?.(m => m.id === newMsg.id)) return prev;

                // Step 3: Add new message
                return [...prev, { ...newMsg, you: newMsg?.senderId === loginUserId }];
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
        if ((!sendMessageText.trim() && selectedFiles.length === 0) || !activeChatObject) return;

        const tempId = `temp-${Date.now()}`;
        const tempMsg: Message = {
            id: tempId,
            senderId: loginUserId,
            message: sendMessageText || selectedFiles.map(f => f.name).join(', '),
            chatChannelId: activeChatObject.id,
            createdAt: new Date().toISOString(),
            sender: { user: { fullName: 'You' } },
            you: true,
        };

        setMessages(prev => [...prev, tempMsg]);
        setSendMessageText('');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        try {
            const formData = new FormData();
            formData.append("senderId", loginUserId);
            formData.append("type", selectedFiles.length ? "media" : "text");

            if (activeChatType === "individual") {
                formData.append("chatChannelId", activeChatObject.id);
            } else {
                formData.append("groupId", activeChatObject.id);
            }

            if (sendMessageText.trim()) {
                formData.append("message", sendMessageText);
            }

            selectedFiles.forEach(file => {
                formData.append("mediaUrl", file); // multiple files
            });

            setSelectedFiles([]); // clear selected

            let saved;

            if (activeChatType === "individual") {
                const res = await messageApiService.sendMessageToSingleConservation(formData); // this handles file + message + s3


                saved = res?.data?.chatMessage;

                const otherId = activeChatObject.providerA.id === loginUserId
                    ? activeChatObject.providerB.id
                    : activeChatObject.providerA.id;

                socket?.emit("send_direct", { toProviderId: otherId, message: saved });
            } else {
                const res = await messageApiService.sendMessagesOfGroupChatChannel(formData);
                saved = res.data.chatMessage;

                socket?.emit("send_group", { message: saved });
            }

            setMessages(prev => prev.map(m => m.id === tempId ? { ...saved, you: true } : m));
        } catch (error) {
            console.error("❌ Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };



    useEffect(() => {

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

        <>

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
                            {groupMsgs.map((msg) => {
                                const mediaFiles = msg.mediaUrl ? msg.mediaUrl.split(',') : [];

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start mb-6 ${msg.you ? 'justify-end' : ''} gap-x-4`}
                                    >
                                        {!msg.you && (
                                            <>
                                                {(msg?.sender?.user?.profileImage !== null && msg?.sender?.user?.profileImage !== "null") ?
                                                    <img className='w-10 h-10 rounded-full object-cover' src={msg?.sender?.user?.profileImage} />
                                                    : <UserIcon size={30} />
                                                }
                                            </>
                                        )}

                                        <div className={`max-w-[75%] flex flex-col ${msg.you ? 'items-end' : ''}`}>
                                            <p className="font-semibold mb-2 capitalize">
                                                {msg?.you ? 'You' : msg?.sender?.user?.fullName}
                                            </p>

                                            <div className="flex items-center gap-x-4 text-[14px]">
                                                {msg?.you && (
                                                    <div className='flex items-center gap-x-2'>


                                                        <p className="text-textGreyColor text-[12px]">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}

                                                        </p>

                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-2">
                                                    {/* Media Files */}
                                                    <div className="flex flex-col gap-2 mt-1">
                                                        {mediaFiles.map((url, index) => {
                                                            const extension = url.split('.').pop()?.toLowerCase();
                                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
                                                            const isPdf = extension === 'pdf';
                                                            const isDoc = ['doc', 'docx'].includes(extension || '');

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                                                                >
                                                                    {isImage ? (
                                                                        <img
                                                                            src={url}
                                                                            alt="media"
                                                                            className="w-32 h-auto rounded-md object-cover border border-gray-300"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xl">
                                                                            {isPdf ? '📄' : isDoc ? '📝' : '📎'}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex flex-col justify-center">
                                                                        <a
                                                                            href={url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 font-medium hover:underline text-sm"
                                                                        >
                                                                            {isImage
                                                                                ? 'View Image'
                                                                                : isPdf
                                                                                    ? 'View PDF'
                                                                                    : isDoc
                                                                                        ? 'Open Document'
                                                                                        : 'Download File'}
                                                                        </a>
                                                                        <p className="text-xs text-gray-400 mt-1">.{extension?.toUpperCase()}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Text Message */}
                                                    {msg.message && (
                                                        <p className={`relative p-4 rounded-lg max-w-xs 
                                ${msg.you ? 'bg-primaryColorDark text-white bubble-right' : 'bg-[#EAF5F4] text-textGreyColor bubble-left'}`}>
                                                            {msg.message}


                                                        </p>
                                                    )}


                                                </div>

                                                {!msg?.you && (
                                                    <p className="text-textGreyColor text-[12px]">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {msg.you && (
                                            <>
                                                {(msg?.sender?.user?.profileImage !== null && msg?.sender?.user?.profileImage !== "null") ?
                                                    <img className='w-10 h-10 rounded-full object-cover' src={msg?.sender?.user?.profileImage} />
                                                    : <UserIcon size={30} />}
                                            </>
                                        )}
                                    </div>
                                );
                            })}

                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div >

                <hr className="my-4 border-inputBgColor" />
                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                        {selectedFiles.map((file, index) => {
                            const extension = file.name.split('.').pop()?.toLowerCase();
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
                            const isPdf = extension === 'pdf';
                            const isDoc = ['doc', 'docx'].includes(extension || '');

                            const fileIcon = isImage
                                ? '🖼️'
                                : isPdf
                                    ? '📄'
                                    : isDoc
                                        ? '📝'
                                        : '📎';

                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm relative max-w-[220px]"
                                >
                                    <div className="text-lg">{fileIcon}</div>
                                    <span className="text-sm truncate max-w-[150px] text-gray-700">{file.name}</span>


                                    <CrossIcon onClick={() => {
                                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                    }} />
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <input
                        className="outline-none pl-4 py-2 w-[70%] bg-white  rounded-lg"
                        placeholder="Type here..."
                        value={sendMessageText}
                        onChange={e => setSendMessageText(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    />
                    <div className="flex items-center gap-x-4 p-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                    setSelectedFiles(prev => [...prev, ...Array.from(files)]);
                                }
                            }}
                        />

                        <IoAttachSharp size={30} className="rotate-45 cursor-pointer text-textGreyColor" onClick={() => fileInputRef.current?.click()} />
                        <button
                            className="h-[38px] w-[38px] bg-primaryColorDark rounded-full flex items-center justify-center text-white"
                            onClick={sendMessage}
                        >
                            <IoIosSend size={24} className='cursor-pointer' />
                        </button>
                    </div>
                </div>
            </div >
        </>
    );
};


export default ChatMessages;
