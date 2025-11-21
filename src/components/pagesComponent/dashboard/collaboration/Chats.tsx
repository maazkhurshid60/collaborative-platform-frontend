import { NavLink } from "react-router-dom";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import UserIcon from "../../../icons/user/User";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { HiPhoto } from "react-icons/hi2";
import { HiDocumentText } from "react-icons/hi2";
import { HiPaperClip } from "react-icons/hi2";

interface ChatsProps {
  data: ChatChannelType;
  activeId?: string | undefined;
  onClick?: () => void;
}

const Chats: React.FC<ChatsProps> = ({ data, onClick }) => {
  const loginUserId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id
  );

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

  const otherUser =
    data?.providerA?.id === loginUserId
      ? {
        fullName: data.providerB?.user?.fullName,
        profileImage: data.providerB?.user?.profileImage,
      }
      : {
        fullName: data.providerA?.user?.fullName,
        profileImage: data.providerA?.user?.profileImage,
      };

  const unreadCount = Number(data?.totalUnread ?? 0);

  const imagePath = otherUser?.profileImage ? otherUser.profileImage : null;

  return (
    < >
      <NavLink
        to="/chat"

      >
        <div
          className={`pb-2 pt-2 pl-2 flex items-center  w-full gap-x-2  transition-all duration-300 cursor-pointer 
            `}
          onClick={onClick}
        >
          <div className="w-[100%] flex items-center justify-between">
            <div className="flex items-start gap-x-6">
              <div>
                {imagePath && imagePath !== "null" ? (
                  <img
                    src={imagePath}
                    alt="Client"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon />
                )}
              </div>
              <div>
                <p
                  className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "
                    }`}
                >
                  {otherUser?.fullName}
                </p>
                {/* Display last message - either text or media */}
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
            <p className="bg-primaryColorDark text-white text-xs px-2 py-1 rounded-full">
              {data.totalUnread}
            </p>
          )}
        </div>
      </NavLink>
    </>
  );
};

export default Chats;
