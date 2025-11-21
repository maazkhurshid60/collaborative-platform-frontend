import { HiUserGroup } from "react-icons/hi";
import { GroupChat } from "../../../../types/chatType/GroupType";
import { HiPhoto } from "react-icons/hi2";
import { HiDocumentText } from "react-icons/hi2";
import { HiPaperClip } from "react-icons/hi2";

interface GroupChatDataType {
  data: GroupChat;
  activeId: string | undefined;
  data: GroupChat;
  activeId: string | undefined;

  onClick: () => void;
  onClick: () => void;
}

const GroupChatData: React.FC<GroupChatDataType> = ({
  data,
  onClick,
  activeId,
}) => {
  const unreadCount = Number(data?.unreadCount ?? 0);

  // Helper function to get media display info
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
    <div className="">
      <div
        className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
                 ${
                   activeId === data?.id
                     ? "bg-primaryColorLight rounded-md"
                     : "bg-white"
                 }`}
        onClick={onClick}
      >
        <div className="w-[80%]">
          <div
            className={`font-[Poppins] text-[14px] text-textColor flex items-center gap-x-4
                         `}
          >
            <HiUserGroup className="text-[40px]" />
            <div>
              <p
                className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${
                  data?.unreadCount !== 0 ? "font-semibold" : "font-normal "
                }`}
              >
                {data?.name}
              </p>
              {/* Display last message - either text or media */}
              {data?.lastMessage && (
                <div className="text-xs text-gray-500 truncate max-w-[90%]">
                  {(data.lastMessage?.type === 'media' && data.lastMessage?.mediaUrl) ? (
                    // Media message display with full info
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
          <span className="bg-primaryColorDark text-white text-xs min-w-[20px] h-5 flex items-center justify-center mr-4 rounded-full px-1 leading-none aspect-square">
            {data.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
        {unreadCount > 0 && (
          <span className="bg-primaryColorDark text-white text-xs min-w-[20px] h-5 flex items-center justify-center mr-4 rounded-full px-1 leading-none aspect-square">
            {data.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default GroupChatData;
