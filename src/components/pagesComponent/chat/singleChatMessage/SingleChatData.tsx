import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
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


    const otherUser =
        data?.providerA?.id === loginUserId
            ? { fullName: data.providerB?.user?.fullName, profileImage: data.providerB?.user?.profileImage }
            : { fullName: data.providerA?.user?.fullName, profileImage: data.providerA?.user?.profileImage };

    const unreadCount = Number(data?.totalUnread ?? 0);
    // const imagePath = `${localhostBaseUrl}uploads/eSignatures/${otherUser?.profileImage?.split('/').pop()}`
    const imagePath = otherUser?.profileImage ? otherUser?.profileImage : null;
    return (
        <div className="">

            <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md 
            ${activeId === data?.id ? "bg-primaryColorLight rounded-md " : "bg-white"}
            `}

                onClick={onClick}>
                <div className='w-[100%] flex items-center justify-between'>
                    <div className="flex items-start gap-x-6">
                        <div className="w-10 h-10">
                            {
                                imagePath ? <img
                                    src={imagePath}
                                    alt="Client"
                                    className="w-full h-full  rounded-full  object-fill"
                                /> : <UserIcon />}
                        </div>
                        <div>
                            <p className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "}`}>
                                {otherUser?.fullName}
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
                    <span className="bg-primaryColorDark text-white text-xs px-2 py-1  mr-4 rounded-full">
                        {data.totalUnread}
                    </span>
                )}


            </div>
        </div>
    );
};

export default SingleChatData;



















