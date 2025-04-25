
import { NavLink } from 'react-router-dom';
interface GroupDataType {
    img: React.ElementType;
    userName: string;
    message: string;
    totalUnread?: number;
}

interface GroupsProps {
    chatData: GroupDataType;
}
const Groups: React.FC<GroupsProps> = (props) => {
    const data = props.chatData;
    const Img = data.img;

    return (
        <NavLink to="/chat" className='mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 border-b-[1px] border-b-solid border-b-textGreyColor/30 hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md hover:border-b-primaryColorLight'>
            < Img size={30} />
            <div className='w-[80%]'>
                <p className='font-[Poppins] font-semibold text-[16px] text-textColor'>{data.userName}</p>
                <p className='font-[Poppins] text-[14px] text-textGreyColor'>{data.message}</p>
            </div>
            {data?.totalUnread !== 0 && <p className='w-5 h-5 rounded-full text-white bg-primaryColorDark flex items-center justify-center text-xs'>{data?.totalUnread}</p>}
        </NavLink >
    )
}

export default Groups