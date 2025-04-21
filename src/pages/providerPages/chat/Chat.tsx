import { useState } from 'react';
import ChatMessages from '../../../components/pagesComponent/chat/chatMessages/ChatMessages';
import GroupChatData from '../../../components/pagesComponent/chat/groupChatData/GroupChatData';
import SingleChatData from '../../../components/pagesComponent/chat/singleChatMessage/SingleChatData';
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import { data } from './DummyData';

import { IoIosArrowBack } from 'react-icons/io';
import ModalLayout from '../../../components/modals/modalLayout/ModalLayout';

import ChatModalBodyContent from '../../../components/modals/providerModal/chatModal/ChatModalBodyContent';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const groupData = data?.filter(data => data?.isGroup).map(({ id,
    groupName,
    isGroup,
    totalUnread,
    groupMembers,
    chatMessage }) => ({
        id,
        groupName,
        isGroup,
        totalUnread,
        groupMembers,
        chatMessage
    }))

const singleChatData = data
    ?.filter(data => !data?.isGroup)
    .map(({ id, isGroup, chatMessage, totalUnread, senderId }) => ({
        id,
        isGroup,
        chatMessage,
        totalUnread,
        senderId: senderId || '', // Fallback to empty string to satisfy type
    }));



const Chat = () => {
    const [activeId, setActiveId] = useState<string | undefined>(undefined)
    const [isChatSideBarClose, setIsChatSideBarClose] = useState<boolean>(false)
    const messageData = data?.find(data => data?.id === activeId)
    const isModalShow = useSelector((state: RootState) => state.modalSlice.isModalShow)

    console.log(isModalShow);

    return (
        <OutletLayout isWhiteColor={false}>
            {isModalShow && <ModalLayout heading='Share this chat by generating a link' modalBodyContent={ChatModalBodyContent()} />
            }
            <div className='flex items-start lg:justify-between relative     h-[80vh] '>
                <div className={`w-[100%] border-r-[1px] border-r-solid border-r-inputBgColor p-4 lg:w-[35%] xl:w-[25%] bg-white rounded-[10px]  absolute z-30 lg:relative ${isChatSideBarClose ? "left-0" : "-left-[200%] lg:left-0"}`}>
                    <p className='font-medium text-[14px] text-textGreyColor'>Recent Chats</p>
                    <div className='  min-h-[34h] max-h-[34vh] bg-  p-2 lg:p-0  overflow-auto'>

                        {singleChatData?.map((data, id: number) => <SingleChatData key={id} data={data} onClick={() => { setActiveId(data.id); setIsChatSideBarClose(false) }} activeId={activeId} />)}

                    </div>
                    <hr className='w-[100%] h-[1px] text-inputBgColor' />

                    <p className='mt-4 font-medium text-[14px] p-2 lg:p-0 text-textGreyColor'>Group Chats</p>
                    <div className='  min-h-[34vh] max-h-[34vh] bg-  p-2 lg:p-0 overflow-auto '>

                        {groupData?.map((data, id: number) => <GroupChatData key={id} data={data} onClick={() => { setActiveId(data.id); setIsChatSideBarClose(false) }} activeId={activeId} />)}

                    </div>
                </div>
                <div className='w-[100%] lg:w-[65%] xl:w-[74.5%] bg-white h-[80vh] rounded-[10px]'>
                    <IoIosArrowBack size={24} className='mb-2  text-textGreyColor lg:hidden' onClick={() => setIsChatSideBarClose(true)} />
                    {messageData && <ChatMessages messageData={messageData} />}
                </div>
            </div>
        </OutletLayout>)
}

export default Chat