
import ChatNavbar from './ChatNavbar';
import { GrAttachment } from "react-icons/gr";
import { IoIosSend } from "react-icons/io";
import UserIcon from '../../../icons/user/User';

interface Messages {
    sender?: string;
    message?: string;
}
interface chatMessagesProps {
    messageData: {
        id?: string;
        senderId?: string
        chatMessage?: Messages[];
        isGroup?: boolean;
        totalUnread?: number
        groupName?: string
        groupMembers?: string[]
    };
}

const ChatMessages: React.FC<chatMessagesProps> = ({ messageData }) => {
    const chatNavbarData = {
        name: messageData?.senderId || messageData?.groupName,
        groupMembers: messageData?.groupMembers
    }
    const conservation = messageData?.chatMessage
    console.log("conservation", messageData === undefined);

    return (<>
        {messageData === undefined ? <p>Select Conservation</p> : <div className='bg-white p-3 rounded-[10px]'>
            <ChatNavbar name={chatNavbarData.name} groupMembers={chatNavbarData.groupMembers} />
            <hr className='text-inputBgColor mt-4 mb-4 font-[Poppins]' />
            <div className='h-[55vh] overflow-y-scroll '>
                {conservation?.map(data => data?.sender === "You" ? <div className=''> <div className='flex items-start justify-end gap-x-4 mb-6'>
                    <div className='max-[]:w-[75%] flex flex-col items-end relative'>
                        <p className='font-semibold mb-2'>
                            {data?.sender}
                        </p>
                        <div className=' text-[14px] flex flex-row-reverse items-center gap-x-4'>
                            <p className='text-white bg-primaryColorDark  p-4 relative rounded-lg'>
                                {data.message}
                            </p>
                            <p className='font-[Merriweather Sans] text-textGreyColor text-[12px]'>12:35am</p>
                        </div>


                    </div>
                    <UserIcon size={30} />


                </div>
                  
                </div> : <div className='flex items-start gap-x-4 mb-6' >
                    <UserIcon size={30} />
                    <div className='max-w-[75%]'>
                        <p className='font-semibold  mb-2'>
                            {data.sender}
                        </p>
                        <div className=' text-[14px]  flex  items-center  gap-x-4'>

                            <p className='text-textGreyColor bg-[#EAF5F4] p-2 relative rounded-lg'>
                                {data.message}
                            </p>
                            <p className='font-[Merriweather Sans] text-textGreyColor text-[12px]'>12:35am</p>

                        </div>

                    </div>

                </div>)}



            </div>
            <hr className='text-inputBgColor mt-4 mb-4' />

            <div className='flex items-center justify-between '>
                <input className='outline-none pl-4  py-2  w-[70%] bg-white' placeholder='Type here...' />
                <div className='flex items-center gap-x-4 p-2'>
                    <GrAttachment size={20} />
                    <div className='h-[38px] w-[38px] rounded-full bg-primaryColorDark text-white flex items-center justify-center'>
                        <IoIosSend size={24} />
                    </div>
                </div>
            </div>
        </div>}

    </>
    )
}

export default ChatMessages
