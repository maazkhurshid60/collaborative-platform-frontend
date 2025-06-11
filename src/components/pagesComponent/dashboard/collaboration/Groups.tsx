
import { NavLink } from 'react-router-dom';
import { GroupChat } from '../../../../types/chatType/GroupType';
import { FaUsers } from 'react-icons/fa';


interface GroupsProps {
    data: GroupChat
    activeId: string | undefined
    onClick: () => void;
}
const Groups: React.FC<GroupsProps> = ({ data, onClick }) => {

    return (
        <div className="">
            <NavLink to="/chat" className='mb-4 pb-2 pt-2 pl-2 flex items-center gap-x-2 border-b-[1px] border-b-solid border-b-textGreyColor/30 hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md hover:border-b-primaryColorLight'>

                <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
                     `} onClick={onClick}>
                    <div className='w-[100%]'>
                        <p className={`font-[Poppins] text-[14px] text-textColor flex items-center gap-x-4 font-semibold
                         `}>
                            <FaUsers className="text-[40px]" />      {data?.name}
                        </p>


                    </div>

                </div>
            </NavLink >

        </div>
    );
};


export default Groups




