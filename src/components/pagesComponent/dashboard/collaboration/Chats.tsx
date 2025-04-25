;
import { NavLink } from 'react-router-dom';

interface ChatDataType {
    img: React.ElementType;
    userName: string;
    message: string;
    totalUnread?: number;
}

interface ChatsProps {
    chatData: ChatDataType;
}

const Chats: React.FC<ChatsProps> = ({ chatData }) => {
    const Img = chatData.img;

    return (
        <NavLink to="/chat" className='mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 border-b-[1px] border-b-solid border-b-textGreyColor/30  hover:border-b-primaryColorLight  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md'>
            <Img size={30} />
            <div className='w-[80%]'>
                <p className='font-[Poppins] font-semibold text-[16px] text-textColor'>
                    {chatData.userName}
                </p>
                <p className='font-[Poppins] text-[14px] text-textGreyColor'>
                    {chatData.message}
                </p>
            </div>
            {chatData?.totalUnread !== 0 && (
                <p className='w-5 h-5 rounded-full text-white bg-primaryColorDark flex items-center justify-center text-xs'>
                    {chatData.totalUnread}
                </p>
            )}
        </NavLink>
    );
};

export default Chats;
