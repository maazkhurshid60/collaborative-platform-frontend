
import Button from '../../../button/Button';
import { FaShareFromSquare } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import UserIcon from '../../../icons/user/User';

interface chatNavbarProps {
    name?: string,
    groupMembers?: string[]
}

const ChatNavbar: React.FC<chatNavbarProps> = (props) => {
    console.log(props);
    const dispatch = useDispatch<AppDispatch>()

    return (
        <div className='flex items-center justify-between '>
            <p className='font-semibold text-[16px] md:text-[20px] lg:text-[24px] font-[Montserrat] inline-block '>{props.name}</p>
            <div className='flex items-center gap-x-4'>
                <div>
                    {props.groupMembers?.length !== undefined &&
                        <div className='flex items-center relative '>
                            <div className='border-solid border-textColor rounded-full border-[1px] p-1.5 bg-white absolute right-0 z-20'>
                                <UserIcon className='text-[20px] md:text-[24px] lg:text-[28px]' />
                            </div>
                            <div className='border-solid border-red-700 rounded-full border-[1px] p-1.5 bg-red-700 absolute right-3 z-10'>
                                <UserIcon className='text-[20px] md:text-[24px] lg:text-[28px]' />
                            </div>
                            <div className='border-solid border-blue-700 rounded-full border-[1px] p-1.5 bg-blue-700 absolute right-6 z-0'>
                                <UserIcon className='text-[20px] md:text-[24px] lg:text-[28px]' />
                            </div>
                            <p className='w-6 h-6 rounded-full text-white bg-primaryColorDark flex items-center justify-center text-xs absolute -right-2 z-24'>
                                +6
                            </p>
                        </div>
                    }
                </div>
                <div className='w-[60px] md:w-[70px] lg:w-[80px]'>
                    <Button text='share' icon={<FaShareFromSquare />} sm onclick={() => {
                        console.log(true);
                        ; dispatch(isModalShowReducser(true))
                    }} />
                </div>
            </div>
        </div >
    )
}

export default ChatNavbar