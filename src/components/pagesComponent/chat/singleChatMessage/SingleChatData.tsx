import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
// import { ProviderType } from "../../../../types/providerType/ProviderType";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import UserIcon from "../../../icons/user/User";



interface SingleChatDataType {
    data: ChatChannelType;
    activeId?: string | undefined
    onClick?: () => void;
    unreadMessagesCount?: string | number

}



const SingleChatData: React.FC<SingleChatDataType> = ({ data, onClick, activeId }) => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);

    console.log("data", data);

    const otherUser =
        data?.providerA?.id === loginUserId
            ? data.providerB?.user?.fullName
            : data.providerA?.user?.fullName;

    console.log("datadatadatadata", activeId);
    const unreadCount = Number(data?.totalUnread ?? 0);

    return (
        <div className="">

            <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md 
            ${activeId === data?.id ? "bg-primaryColorLight rounded-md " : "bg-white"}
            `}

                onClick={onClick}>
                <div className='w-[80%] flex items-center justify-between'>
                    <div className="flex items-start gap-x-6">
                        <div>

                            <UserIcon />
                        </div>
                        <div>
                            <p className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "}`}>
                                {otherUser}
                            </p>
                            {data?.lastMessage?.message && (
                                <p className="text-xs text-gray-500 truncate max-w-[90%]">
                                    {data.lastMessage.message}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
                {unreadCount > 0 && (
                    <span className="bg-primaryColorDark text-white text-xs px-2 py-1 rounded-full">
                        {data.totalUnread}
                    </span>
                )}


            </div>
        </div>
    );
};

export default SingleChatData;



















