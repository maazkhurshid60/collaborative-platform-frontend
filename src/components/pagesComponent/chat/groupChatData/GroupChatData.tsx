import { FaUsers } from "react-icons/fa";
import { GroupChat } from "../../../../types/chatType/GroupType";





interface GroupChatDataType {
    data: GroupChat
    activeId: string | undefined
    onClick: () => void;
}

const GroupChatData: React.FC<GroupChatDataType> = ({ data, onClick, activeId }) => {
    console.log("group data", data);

    return (
        <div className="">

            <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
                 ${activeId === data?.id ? "bg-primaryColorLight rounded-md" : "bg-white"}`} onClick={onClick}>
                <div className='w-[80%]'>
                    <p className={`font-[Poppins] text-[14px] text-textColor flex items-center gap-x-4 font-semibold
                         `}>
                        {/* ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "} */}
                        <FaUsers className="text-[40px]" />      {data?.name}
                    </p>
                    {/* <p className={`font-[Poppins] text-[12px]  ${data?.totalUnread !== 0 ? "font-semibold text-textColor" : "font-normal text-textGreyColor "}`}>
                        {data.chatMessage[data?.chatMessage?.length - 1]?.message}
                    </p> */}

                </div>
                {/*  {data?.totalUnread !== 0 && (
                    <p className='w-5 h-5 rounded-full text-white bg-primaryColorDark flex items-center justify-center text-xs'>
                        {data.totalUnread}
                    </p>
                )}*/}
            </div>
        </div>
    );
};

export default GroupChatData;
