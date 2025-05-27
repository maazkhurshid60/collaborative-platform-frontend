;
import { NavLink } from 'react-router-dom';
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType';
import UserIcon from '../../../icons/user/User';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { localhostBaseUrl } from '../../../../apiServices/baseUrl/BaseUrl';



interface ChatsProps {
    data: ChatChannelType;
    activeId?: string | undefined
    onClick?: () => void;
    unreadMessagesCount?: string | number
}

const Chats: React.FC<ChatsProps> = ({ data, onClick, activeId }) => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);

    console.log("data", data);

    const otherUser =
        data?.providerA?.id === loginUserId
            ? { fullName: data.providerB?.user?.fullName, profileImage: data.providerB?.user?.profileImage }
            : { fullName: data.providerA?.user?.fullName, profileImage: data.providerA?.user?.profileImage };

    console.log("datadatadatadata", activeId);
    const unreadCount = Number(data?.totalUnread ?? 0);
    const imagePath = `${localhostBaseUrl}uploads/eSignatures/${otherUser?.profileImage?.split('/').pop()}`
    return (
        <div className="">
            <NavLink to="/chat" className='mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 
             border-b-[1px] border-b-solid border-b-textGreyColor/30  hover:border-b-primaryColorLight 
              hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md  bg-inputBgColor'>
                <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  transition-all duration-300 cursor-pointer 
            `}

                    onClick={onClick}>
                    <div className='w-[80%] flex items-center justify-between'>
                        <div className="flex items-start gap-x-6">
                            <div>
                                {(otherUser?.profileImage !== null && otherUser?.profileImage !== "null") ? <img
                                    src={imagePath}
                                    alt="Client"
                                    className="w-20 h-12 rounded-full object-cover"
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
                        <span className="bg-primaryColorDark text-white text-xs px-2 py-1 rounded-full">
                            {data.totalUnread}
                        </span>
                    )}


                </div>
            </NavLink>

        </div>
    );
};

export default Chats;





