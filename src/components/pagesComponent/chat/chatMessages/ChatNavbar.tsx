
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

    console.log("props?.groupMembers", props?.groupMembers);
    const dispatch = useDispatch<AppDispatch>()

    return (
        <>


            <div className='flex items-center justify-between '>
                <p className='font-semibold text-[16px] md:text-[20px] lg:text-[24px] font-[Montserrat] inline-block  capitalize'>{props.name}</p>
                <div className='flex items-center gap-x-4'>
                    <div>
                        {props?.groupMembers?.length !== undefined && (
                            <div className="flex items-center relative h-8">
                                {props?.groupMembers?.slice(0, 2).map((_, id: number) => (
                                    <div
                                        key={id}
                                        className="border-solid border-textColor rounded-full border-[1px] p-1.5 bg-white absolute z-20"
                                        style={{ right: `${id * 20}px` }}
                                    >
                                        <UserIcon className="text-[20px] md:text-[24px] lg:text-[28px]" />
                                    </div>
                                ))}
                                <div className='relative'>
                                    {props?.groupMembers?.length > 2 && (
                                        <div
                                            className=" absolute right-[-10px] z-20 top-[-10px] flex items-center justify-center w-6 h-6 text-xs text-white bg-primaryColorDark rounded-full"

                                        >
                                            +{props?.groupMembers?.length - 2}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                    <div className='w-[60px] md:w-[70px] lg:w-[80px]'>
                        <Button text='share' icon={<FaShareFromSquare />} sm onclick={() => {
                            console.log(true);
                            ; dispatch(isModalShowReducser(true))
                        }} />
                    </div>
                </div>
            </div >
        </>
    )
}

export default ChatNavbar