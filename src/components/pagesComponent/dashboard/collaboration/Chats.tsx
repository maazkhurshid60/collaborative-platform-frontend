import { NavLink } from "react-router-dom";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import UserIcon from "../../../icons/user/User";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

interface ChatsProps {
  data: ChatChannelType;
  activeId?: string | undefined;
  onClick?: () => void;
}

const Chats: React.FC<ChatsProps> = ({ data, onClick }) => {
  const loginUserId = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.id
  );

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
    <div className="">
      <NavLink
        to="/chat"
        className="mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 
             border-b-[1px] border-b-solid border-b-textGreyColor/30  hover:border-b-primaryColorLight 
              hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md  bg-inputBgColor"
      >
        <div
          className={`pb-2 pt-2 pl-2 flex items-center  w-full gap-x-2  transition-all duration-300 cursor-pointer 
            `}
          onClick={onClick}
        >
          <div className="w-[100%] flex items-center justify-between">
            <div className="flex items-start gap-x-6">
              <div>
                {imagePath ? (
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
                  className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${
                    data?.totalUnread !== 0 ? "font-semibold" : "font-normal "
                  }`}
                >
                  {otherUser?.fullName}
                </p>
                {/* {data?.lastMessage?.message && (
                                    <p className="text-xs text-gray-500 truncate max-w-[90%]">
                                        {data.lastMessage.message}
                                    </p>
                                )} */}
                {data?.lastMessage?.message && (
                  <p className="text-xs text-gray-500 truncate max-w-[90%]">
                    {data.lastMessage.message?.length > 15
                      ? data.lastMessage.message.slice(0, 15) + "..."
                      : data.lastMessage.message}
                  </p>
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
    </div>
  );
};

export default Chats;
