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
import { GroupChat, GroupCreatedBy, GroupMember } from '../../../../types/chatType/GroupType';
import "./chat.css"
import CrossIcon from '../../../icons/cross/Cross';
import { useQueryClient } from '@tanstack/react-query';
import { NewMessage } from '../../../../types/chatType/ChatType';
import SpinnerLoader from '../../../loader/SpinnerLoader';

import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";




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
    status?: string
}


interface ChatMessagesProps {
    messageData: Message[];
    activeChatObject: ChatChannelType | GroupChat;
    activeChatType?: 'individual' | 'group';
    groupCreatedBy?: GroupCreatedBy

}
const ChatMessages: React.FC<ChatMessagesProps> = ({ messageData, activeChatObject, activeChatType, groupCreatedBy }) => {



    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);





    const loginUserProfileImage = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user.profileImage);
    const [sendMessageText, setSendMessageText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

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
            const isSameGroup =
                activeChatType === 'group' && newMsg.groupId === activeChatObject?.id;

            const isSameIndividual =
                activeChatType === 'individual' && newMsg.chatChannelId === activeChatObject?.id;

            const isSameChat = isSameGroup || isSameIndividual;

            if (!isSameChat) return; // 🛑 Ignore message not related to open chat

            setMessages(prev => {
                const alreadyExists = prev.some(m => m.id === newMsg.id);
                if (alreadyExists) return prev;

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
            status: 'sending'
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

            setMessages(prev => prev.map(m => m.id === tempId ? { ...saved, you: true, status: 'sent' } : m));
            // Update lastMessage + unread count in chatChannels cache
            queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], oldData => {
                if (!oldData) return oldData;
                return oldData.map(channel =>
                    channel.id === activeChatObject.id
                        ? {
                            ...channel,
                            lastMessage: {
                                id: saved.id,
                                message: saved.message || 'New message',
                                createdAt: saved.createdAt,
                            },
                            totalUnread: 0, // you sent it, so no unread
                            updatedAt: new Date().toISOString(),
                        }
                        : channel
                );
            });
            queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], (oldGroups = []) =>
                oldGroups.map((group) => {
                    if (group.id === saved.groupId) {
                        return {
                            ...group,
                            lastMessage: {
                                id: saved.id,
                                message: saved.message || saved.mediaUrl || '📎 File',
                                createdAt: saved.createdAt || new Date().toISOString(),
                            },
                            unreadCount:
                                saved.senderId === loginUserId
                                    ? group.unreadCount
                                    : (Number(group.unreadCount) || 0) + 1,
                            updatedAt: new Date().toISOString(),
                        };
                    }
                    return { ...group }; // ✅ force clone every object
                })
            );


        } catch (error) {
            console.error("❌ Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };



    useEffect(() => {

        if (socket && activeChatObject?.id) {
            socket.emit('join_channel', { chatChannelId: activeChatObject.id });
            console.log("✅ Joined chat channel:");
        }
    }, [activeChatObject?.id]);


    useEffect(() => {
        if (!socket && loginUserId) {
            initSocket(loginUserId, "");
        }
    }, [loginUserId]);


    const messageContainerRef = useRef<HTMLDivElement>(null);


    const fetchMessages = async (currentPage = 1) => {
        if (!activeChatObject) return;

        const container = messageContainerRef.current;
        const oldScrollHeight = container?.scrollHeight || 0;

        setLoading(true);

        try {
            const payload = {
                loginUserId,
                page: currentPage,
                limit: 10,
                ...(activeChatType === 'individual'
                    ? { chatChannelId: activeChatObject.id }
                    : { groupId: activeChatObject.id })
            };

            let res;
            let newMessages: Message[] = [];

            if (activeChatType === 'individual') {
                res = await messageApiService.getAllMessagesOfSingleChatChannel(payload);
                newMessages = res?.data?.messages || [];
            } else {
                res = await messageApiService.getAllMessagesOfGroupChatChannel(payload);
                newMessages = res?.data?.groupMessages || [];
            }

            setMessages(prev => [
                ...newMessages.map(m => ({ ...m, you: m.senderId === loginUserId })),
                ...prev,
            ]);

            setHasMore(res?.data?.hasMore);
            setPage(currentPage);

            // Maintain scroll position
            setTimeout(() => {
                const newScrollHeight = container?.scrollHeight || 0;
                if (container) {
                    container.scrollTop = newScrollHeight - oldScrollHeight;
                }
            }, 100);
        } catch (error) {
            console.error("❌ Failed to fetch messages:", error);
        }

        setLoading(false);
    };


    useEffect(() => {
        if (!socket || !loginUserId) return;

        const handleNewMessage = (newMessage: NewMessage) => {
            const isGroup = newMessage?.isGroupMessage;
            const queryKey = isGroup ? ['groupChatchannels'] : ['chatchannels'];

            // Update sidebar chat list for both individual and group chats
            queryClient.setQueryData(queryKey, (oldData: ChatChannelType[] = []) =>
                oldData.map(channel =>
                    channel.id === newMessage.chatChannelId
                        ? {
                            ...channel,
                            lastMessage: {
                                id: newMessage.id!,
                                message: newMessage.message || 'New Message',
                                createdAt: newMessage.createdAt || new Date().toISOString(),
                            },
                            ...(isGroup
                                ? {
                                    unreadCount: newMessage.senderId === loginUserId ? channel.unreadCount : Number(channel.unreadCount || 0) + 1
                                }
                                : {
                                    totalUnread: newMessage.senderId === loginUserId ? channel.totalUnread : Number(channel.totalUnread || 0) + 1
                                }
                            ),
                            updatedAt: new Date().toISOString(),
                        }
                        : channel
                )
            );
        };

        socket.on('receive_direct', handleNewMessage);
        socket.on('receive_group', handleNewMessage);

        return () => {
            socket.off('receive_direct', handleNewMessage);
            socket.off('receive_group', handleNewMessage);
        };
    }, [socket, loginUserId, queryClient]);


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
                    id={activeChatObject.id}
                    groupMembers={(activeChatObject?.members as GroupMember[]) ?? []}
                    groupCreatedBy={groupCreatedBy}
                />            <hr className="my-4 border-inputBgColor" />

                <div className="flex-1 overflow-y-auto mb-4" ref={messageContainerRef} >
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">No messages yet</div>
                    )}
                    {loading && (
                        <SpinnerLoader text="Messages are Loading" />
                    )}

                    {Object.entries(groupMessagesByDate(messages)).map(([dateGroup, groupMsgs]) => (
                        <div key={dateGroup}>
                            <div className="sticky top-0 z-10 bg-white py-2 font-[Poppins] text-[16px] text-gray-500">
                                {dateGroup}
                            </div>
                            {groupMsgs.map((msg) => {
                                const mediaFiles = msg.mediaUrl ? msg.mediaUrl.split(',') : [];



                                // Render the message
                                return (
                                    <div key={msg.id} className={`flex items-start mb-6 ${msg.you ? 'justify-end' : ''} gap-x-4`}>
                                        {/* If it's not your message, show the sender's profile */}
                                        {!msg.you && (
                                            <>
                                                {(msg?.sender?.user?.profileImage !== null && msg?.sender?.user?.profileImage !== "null") ?
                                                    <img className='w-10 h-10 rounded-full object-cover' src={msg?.sender?.user?.profileImage} />
                                                    : <UserIcon size={30} />
                                                }
                                            </>
                                        )}

                                        {/* Message content */}
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

                                                <div className="flex flex-col gap-2 relative">
                                                    {/* Media Files */}
                                                    <div className="flex flex-col gap-2 mt-1">
                                                        {mediaFiles.map((url, index) => {
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

                                                    {/* Decrypted Text Message */}
                                                    {msg.message && (
                                                        <p className={`relative p-4 rounded-lg max-w-xs break-all ${msg.you ? 'bg-primaryColorDark text-white bubble-right' : 'bg-[#EAF5F4] text-textGreyColor bubble-left'}`}>
                                                            {msg.message}
                                                        </p>
                                                    )}
                                                    <div className='absolute bottom-0.5 right-0.5'>
                                                        {msg.you && msg.status === 'sent' && <FaCircleCheck className='text-white' size={12} />}
                                                        {msg.you && msg.status === 'sending' && <FaRegCircle className='text-white' size={12} />}
                                                    </div>
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
                                                {(loginUserProfileImage !== null && loginUserProfileImage !== "null") ?
                                                    <img className='w-10 h-10 rounded-full object-cover' src={loginUserProfileImage} />
                                                    : <UserIcon size={30} />
                                                }
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
