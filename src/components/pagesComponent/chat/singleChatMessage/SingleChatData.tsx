import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
// import { ProviderType } from "../../../../types/providerType/ProviderType";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";

// interface Messages {
//     sender?: string;
//     message?: string;
// }

interface SingleChatDataType {
    data: ChatChannelType;
    activeId?: string | undefined
    onClick?: () => void;

}

// interface message {
//     id?: string
//     providerA?: ProviderType
//     providerB?: ProviderType
//     providerAId?: string
//     providerBId?: string
//     senderId?: string
// }

const SingleChatData: React.FC<SingleChatDataType> = ({ data, onClick, activeId }) => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
    // console.log("data>>>>>>>>>allchanne;>>>>>", data?.messages);

    // const formattedMessages = data?.messages?.map(message => {
    //     if (message?.senderId === loginUserId) {
    //         return { ...message, providerA: message.senderId };
    //     } else {
    //         return { ...message, providerB: message.senderId };
    //     }
    // });

    // const lastMessage = (formattedMessages || [])[formattedMessages?.length - 1];
    // const lastMessage = formattedMessages?.[formattedMessages.length - 1];

    const otherUser =
        data?.providerA?.id === loginUserId
            ? data.providerB?.user?.fullName
            : data.providerA?.user?.fullName;


    // console.log("messages", messages?.messages?.filter(data=>data.chatChannelId === data.id));
    // console.log("data", data);
    return (
        <div className="">

            <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md 
            ${activeId === data?.id ? "bg-primaryColorLight rounded-md " : "bg-white"}
            `}

                onClick={onClick}>
                <div className='w-[80%]'>
                    <p className={`font-[Poppins] capitalize  text-[14px] text-textColor  ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "}`}>
                        {otherUser}
                    </p>
                    {/* <p className={`font-[Poppins] text-[12px]  ${lastMessage?.readStatus !== "read" ? "font-semibold text-textColor" : "font-normal text-textGreyColor "}`}>

                    </p> */}

                </div>

            </div>
        </div>
    );
};

export default SingleChatData;



















