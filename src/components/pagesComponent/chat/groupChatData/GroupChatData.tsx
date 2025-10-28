import { HiUserGroup } from "react-icons/hi";
import { GroupChat } from "../../../../types/chatType/GroupType";





interface GroupChatDataType {
    data: GroupChat
    activeId: string | undefined

    onClick: () => void;
}

const GroupChatData: React.FC<GroupChatDataType> = ({ data, onClick, activeId }) => {
    const unreadCount = Number(data?.unreadCount ?? 0);

    return (
        <div className="">

            <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
                 ${activeId === data?.id ? "bg-primaryColorLight rounded-md" : "bg-white"}`} onClick={onClick}>
                <div className='w-[80%]'>
                    <div className={`font-[Poppins] text-[14px] text-textColor flex items-center gap-x-4
                         `}>
                        <HiUserGroup className="text-[40px]" />
                        <div>
                            <p className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${data?.unreadCount !== 0 ? "font-semibold" : "font-normal "}`}>
                                {data?.name}
                            </p>
                            {data?.lastMessage?.message && (
                                <p className="text-xs text-gray-500 truncate max-w-[90%]">
                                    {data.lastMessage.message.slice(0, 15) + "..."}
                                </p>
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
};

export default GroupChatData;
