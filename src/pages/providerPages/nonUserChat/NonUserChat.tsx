import Button from '../../../components/button/Button'
import { NavLink } from 'react-router-dom'
import NonUserChatMessages from '../../../components/pagesComponent/chat/chatMessages/NonUserChatMessages'
const messageData = {
    id: "1234rewq",
    groupName: "Group1",
    totalUnread: 1,
    isGroup: true,
    groupMembers: ["Provider1", "Provider2"],
    chatMessage: [
        {
            id: "m1",
            senderId: "provider2",
            message: "Hi",
            chatChannelId: "1234rewq",
            createdAt: new Date().toISOString(),
            sender: {
                user: {
                    fullName: "Provider 2"
                }
            }
        },
        {
            id: "m2",
            senderId: "provider3",
            message: "Hi",
            chatChannelId: "1234rewq",
            createdAt: new Date().toISOString(),
            sender: {
                user: {
                    fullName: "Provider 3"
                }
            }
        },
        {
            id: "m3",
            senderId: "providerYou",
            message: "Hi",
            chatChannelId: "1234rewq",
            createdAt: new Date().toISOString(),
            sender: {
                user: {
                    fullName: "You"
                }
            }
        }
    ]
}

const NonUserChat = () => {
    return (<>
        <div className='p-4 flex items-center justify-between'>
            <p>Logo</p>

            <div className='w-[160px] sm:w-[210px] flex items-center gap-x-3'>
                <NavLink to="/" className='w-[80px] sm:w-[100px]'>
                    <Button text='Login' borderButton />
                </NavLink>
                <NavLink to="/client-signup" className='w-[80px] sm:w-[100px]'>
                    <Button text='Signup' />
                </NavLink >
            </div>

        </div>
        <div className='bg-inputBgColor min-h-[90vh] flex items-center justify-center'>
            <div className='w-[90%] md:w-[60%] bg-white m-auto mt-4 p-4 rounded-md min-h-[86vh] max-h-[86vh] overflow-auto'>
                <NonUserChatMessages messageData={messageData?.chatMessage} />
            </div>
        </div>
    </>
    )
}

export default NonUserChat