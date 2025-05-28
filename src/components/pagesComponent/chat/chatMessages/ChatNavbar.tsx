
import Button from '../../../button/Button';
import { FaShareFromSquare } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import UserIcon from '../../../icons/user/User';
import { useState } from 'react';
import { localhostBaseUrl } from '../../../../apiServices/baseUrl/BaseUrl';
import { GroupMember } from '../../../../types/chatType/GroupType';

interface chatNavbarProps {
    name?: string,
    groupMembers: GroupMember[]
}

const ChatNavbar: React.FC<chatNavbarProps> = (props) => {
    const [isShowModal, setIsShowModal] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    // console.log("groupmemebres image", `${localhostBaseUrl}uploads/eSignatures/${props.groupMembers[0]?.Provider?.user?.profileImage?.split('/').pop()}`);
    console.log("groupmemebres image", props.groupMembers);


    return (
        <>


            <div className='flex items-center justify-between '>
                <p className='font-semibold text-[16px] md:text-[20px] lg:text-[24px] font-[Montserrat] inline-block  capitalize'>{props.name}</p>
                <div className='flex items-center gap-x-4'>
                    <div>
                        {props?.groupMembers?.length !== undefined && (
                            <div className="flex items-center relative h-8">
                                {props?.groupMembers?.slice(0, 2).map((data, id: number) => (
                                    <div
                                        key={id}
                                        className="border-solid border-textColor rounded-full border-[1px] p-1.5 bg-white absolute z-20"
                                        style={{ right: `${id * 20}px` }}
                                    >



                                        {(data?.Provider?.user?.profileImage !== null && data?.Provider?.user?.profileImage !== "null") ?
                                            <img
                                                className='w-12 h-12 rounded-full object-cover'
                                                src={`${localhostBaseUrl}uploads/eSignatures/${data?.Provider?.user?.profileImage?.split('/').pop()}`} />
                                            : <UserIcon className="text-[20px] md:text-[24px] lg:text-[28px]" />}
                                    </div>
                                ))}
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsShowModal(true)}
                                    onMouseLeave={() => setIsShowModal(false)}
                                >
                                    {props?.groupMembers?.length > 2 && (
                                        <div
                                            className="absolute right-[-10px] top-[-10px] z-20 flex items-center justify-center w-6 h-6 text-xs text-white bg-primaryColorDark rounded-full cursor-pointer"
                                        >
                                            +{props?.groupMembers?.length - 2}
                                        </div>
                                    )}

                                    {isShowModal && (
                                        <div
                                            className="absolute  p-4 rounded-2xl top-full right-0 mt-2 w-[220px] max-h-[300px] min-h[200px] bg-white border-1 border-gray-300  z-30 gap-y-4 flex flex-col"

                                        >
                                            <p className='text-sm font-semibold'>Your Group Members:</p>
                                            {props?.groupMembers?.map((data) => <div className='flex items-center gap-x-2 '>
                                                {(data?.Provider?.user?.profileImage !== null && data?.Provider?.user?.profileImage !== "null") ?
                                                    <img
                                                        className='w-7 h-7 rounded-full object-cover'
                                                        src={`${localhostBaseUrl}uploads/eSignatures/${data?.Provider?.user?.profileImage?.split('/').pop()}`} />

                                                    : <UserIcon className="text-[20px] md:text-[24px] lg:text-[28px]" />}
                                                <div className='text-xs'>
                                                    <p className='font-semibold capitalize'>{data?.Provider?.user?.fullName}</p>
                                                    <p>{data?.Provider?.email}</p>
                                                </div>
                                            </div>)}
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