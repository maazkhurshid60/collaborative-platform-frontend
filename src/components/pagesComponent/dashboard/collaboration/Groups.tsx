
import { NavLink } from 'react-router-dom';
import { GroupChat } from '../../../../types/chatType/GroupType';
import { HiUserGroup } from "react-icons/hi";


interface GroupsProps {
    data: GroupChat
    activeId: string | undefined
    onClick: () => void;
}
const Groups: React.FC<GroupsProps> = ({ data, onClick }) => {
    const unreadCount = Number(data?.unreadCount ?? 0);

    return (
        <div className="">
            <NavLink to="/chat" className='mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 border-b-[1px] border-b-solid border-b-textGreyColor/30 hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md hover:border-b-primaryColorLight'>

                <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  w-full  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
                     `} onClick={onClick}>
                    <div className='w-[100%]'>
                        <div className={`font-[Poppins] text-[14px] text-textColor flex items-center gap-x-4 font-semibold
                         `}>
                            <HiUserGroup className="text-[40px]" />
                            <div>
                                {data?.name}
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
                            {data.unreadCount}
                        </span>
                    )}

                </div>
            </NavLink >

        </div>
    );
};


export default Groups




