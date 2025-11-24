
import { NavLink } from 'react-router-dom';
import { GroupChat } from '../../../../types/chatType/GroupType';
import { HiDocumentText, HiPaperClip, HiUserGroup } from "react-icons/hi";
import { HiPhoto } from 'react-icons/hi2';


interface GroupsProps {
    data: GroupChat
    activeId: string | undefined
    onClick: () => void;
}
const Groups: React.FC<GroupsProps> = ({ data, onClick }) => {
    const unreadCount = Number(data?.unreadCount ?? 0);
    const getMediaDisplayInfo = (mediaUrl?: string) => {
        if (!mediaUrl) return null;

        const extension = mediaUrl.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
        const isPdf = extension === 'pdf';
        const isDoc = ['doc', 'docx'].includes(extension || '');

        if (isImage) {
            return { icon: HiPhoto, text: 'Photo' };
        } else if (isPdf || isDoc) {
            return { icon: HiDocumentText, text: 'Document' };
        } else {
            return { icon: HiPaperClip, text: 'File' };
        }
    };
    return (
        <div className="overflow-x-hidden">
            <NavLink to="/chat" className='mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 border-b-[1px] border-b-solid border-b-textGreyColor/30 hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md hover:border-b-primaryColorLight'>

                <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  w-full  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
                     `} onClick={onClick}>
                    <div className='w-[100%]'>
                        <div className={`font-[Poppins] text-[14px] text-textColor flex items-center gap-x-4 font-semibold 
                         `}>
                            <HiUserGroup className="text-[40px]" />
                            <div>
                                {data?.name}
                                {data?.lastMessage && (
                                    <div className="text-xs text-gray-500 truncate max-w-[90%]">
                                        {(data.lastMessage?.type === 'media' && data.lastMessage?.mediaUrl) ? (
                                            (() => {
                                                const mediaInfo = getMediaDisplayInfo(data.lastMessage.mediaUrl);
                                                if (mediaInfo) {
                                                    const IconComponent = mediaInfo.icon;
                                                    return (
                                                        <div className="flex items-center gap-1">
                                                            <IconComponent className="w-4 h-4" />
                                                            <span>{mediaInfo.text}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()
                                        ) : data.lastMessage?.message && data.lastMessage.message.trim() !== '' ? (
                                            // Text message display
                                            <p>
                                                {data.lastMessage.message.length > 15
                                                    ? data.lastMessage.message.slice(0, 15) + "..."
                                                    : data.lastMessage.message}
                                            </p>
                                        ) : (
                                            // Fallback for media messages with empty message field
                                            <div className="flex items-center gap-1">
                                                <HiPhoto className="w-4 h-4" />
                                                <span>Media</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <span className="bg-primaryColorDark text-white text-xs px-2 py-1  mr-4 rounded-full">
                            {data.unreadCount}
                        </span>
                    )}

                </div>
            </NavLink >

        </div>
    );
};


export default Groups




