import { useState } from 'react'
import SearchBar from '../../../searchBar/SearchBar'
import Groups from './Groups'
import Chats from './Chats'
import { IconType } from "react-icons";
import UserIcon from '../../../icons/user/User';

export interface ChatDataType {
    img: IconType; // from react-icons
    type: string;
    userName: string;
    message: string;
    totalUnread: number;
}
const Collaboration = () => {
    const [activeTab, setActiveTab] = useState(0)
    const tabs = ["Chats", "Groups"]
    const chatData = [{ img: UserIcon, type: "chat", userName: "Ursala Peppertrout", message: "Hi", totalUnread: 2 }
        , { img: UserIcon, type: "chat", userName: "Ursala Peppertrout", message: "Hi", totalUnread: 4 },
    { img: UserIcon, type: "chat", userName: "Ursala Peppertrout", message: "Hi", totalUnread: 0 }
    ]

    const groupData = [{ img: UserIcon, type: "chat", userName: "Patient1 Group", message: "Hi", totalUnread: 3 }
        , { img: UserIcon, type: "chat", userName: "Patient2 Group", message: "Hi", totalUnread: 0 },
    { img: UserIcon, type: "chat", userName: "Patient3 Group", message: "Hi", totalUnread: 20 },
    { img: UserIcon, type: "chat", userName: "Patient4 Group", message: "Hi", totalUnread: 3 },
    { img: UserIcon, type: "chat", userName: "Patient5 Group", message: "Hi", totalUnread: 0 },
    { img: UserIcon, type: "chat", userName: "Patient6 Group", message: "Hi", totalUnread: 20 }
    ]

    return (
        <div>
            <div className='mt-4'>
                <SearchBar sm />
            </div>

            <div className='flex items-center mt-4'>
                {tabs.map((tab, id) => (
                    <p
                        key={id}
                        className={`w-1/2 font-medium cursor-pointer text-center transition-colors duration-300 ${activeTab === id ? 'text-primaryColorDark' : 'text-gray-500'
                            }`}
                        onClick={() => setActiveTab(id)}
                    >
                        {tab}
                    </p>
                ))}
            </div>

            <div className='relative'>
                <hr className='text-textGreyColor/30 h-[1px] w-full mt-2' />
                <hr
                    className={`text-primaryColorDark h-[1px] w-1/2 mt-2 absolute -top-2 
                        transition-all duration-300 ease-in-out 
                        ${activeTab === 0 ? 'left-0' : 'left-1/2'}`}
                />
            </div>

            <div className='mt-4'>
                {activeTab === 0 ? chatData?.map((data, id: number) => <Chats chatData={data} key={id} />) : groupData?.map((data, id: number) => <Groups chatData={data} key={id} />)}
            </div>
        </div>
    )
}

export default Collaboration
