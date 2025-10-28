import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import UserIcon from "../../../icons/user/User";
import { useEffect } from "react";



interface SingleChatDataType {
    data: ChatChannelType;
    activeId?: string | undefined
    onClick?: () => void;

}



const SingleChatData: React.FC<SingleChatDataType> = ({ data, onClick, activeId }) => {
    const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);


    const otherUser =
        data?.providerA?.id === loginUserId
            ? { fullName: data?.providerB?.user?.fullName, profileImage: data?.providerB?.user?.profileImage }
            : { fullName: data?.providerA?.user?.fullName, profileImage: data?.providerA?.user?.profileImage };

    const unreadCount = Number(data?.totalUnread ?? 0);
    const imagePath = otherUser?.profileImage ? otherUser?.profileImage : null;
    useEffect(() => {
        console.log("🔁 Re-render Sidebar Item:", data.id, "data.lastMessage?.message", data.lastMessage?.message, data.updatedAt);
    }, [data.lastMessage?.message, data.updatedAt]);


    return (
        <div className="">

            <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md 
            ${activeId === data?.id ? "bg-primaryColorLight rounded-md " : "bg-white"}
            `}

                onClick={onClick}>
                <div className='w-[100%] flex items-center justify-between'>
                    <div className="flex items-start gap-x-6">
                        <div className="w-10 h-10">
                            {
                                imagePath ? <img
                                    src={imagePath}
                                    alt="Client"
                                    className="w-full h-full  rounded-full  object-fill"
                                /> : <UserIcon />}
                        </div>
                        <div>
                            <p className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "}`}>
                                {otherUser?.fullName}
                            </p>
                            {data?.lastMessage?.message && (
                                <p className="text-xs text-gray-500 truncate max-w-[90%]">
                                    {data.lastMessage.message?.slice(0, 15) + "..."}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
                {unreadCount > 0 && (
                    <span className="bg-primaryColorDark text-white text-xs min-w-[20px] h-5 flex items-center justify-center mr-4 rounded-full px-1 leading-none aspect-square">
                        {data.totalUnread}
                    </span>
                )}


            </div>
        </div>
    );
};

export default SingleChatData;




















// import { useSelector } from "react-redux";
// import { RootState } from "../../../../redux/store";
// import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
// import UserIcon from "../../../icons/user/User";
// import { useEffect, useState } from "react";
// import { decryptMessage } from "../../../../utils/EncryptedMessage";

// import naclUtil from 'tweetnacl-util';
// import nacl from "tweetnacl";


// interface SingleChatDataType {
//     data: ChatChannelType;
//     activeId?: string | undefined
//     onClick?: () => void;

// }



// const SingleChatData: React.FC<SingleChatDataType> = ({ data, onClick, activeId }) => {
//     const loginUserId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id);
//     const base64Key = useSelector(
//         (state: RootState) => state.LoginUserDetail?.decryptedPrivateKey
//     );

//     const decryptedPrivateKey = base64Key ? naclUtil.decodeBase64(base64Key) : null;




//     const otherUser =
//         data?.providerA?.id === loginUserId
//             ? { fullName: data?.providerB?.user?.fullName, profileImage: data?.providerB?.user?.profileImage }
//             : { fullName: data?.providerA?.user?.fullName, profileImage: data?.providerA?.user?.profileImage };

//     const unreadCount = Number(data?.totalUnread ?? 0);
//     const imagePath = otherUser?.profileImage ? otherUser?.profileImage : null;
//     const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null)
//     useEffect(() => {
//         const msg = data?.lastMessage?.message;

//         if (msg && decryptedPrivateKey) {
//             try {
//                 const parsedMsg = typeof msg === 'string' ? JSON.parse(msg) : msg;

//                 if (
//                     !parsedMsg?.senderPublicKey ||
//                     !parsedMsg?.nonce ||
//                     !parsedMsg?.ciphertext
//                 ) {
//                     console.warn("⚠️ Message format invalid", parsedMsg);
//                     setDecryptedMessage("🔒 Encrypted (invalid format)");
//                     return;
//                 }

//                 const senderPublicKey = naclUtil.decodeBase64(parsedMsg.senderPublicKey);
//                 const nonce = naclUtil.decodeBase64(parsedMsg.nonce);
//                 const ciphertext = naclUtil.decodeBase64(parsedMsg.ciphertext);

//                 // Validate buffer lengths
//                 if (
//                     senderPublicKey.length !== 32 ||
//                     decryptedPrivateKey.length !== 32 ||
//                     nonce.length !== 24
//                 ) {
//                     console.warn("⚠️ Invalid key or nonce length", {
//                         senderPublicKey: senderPublicKey.length,
//                         myPrivateKey: decryptedPrivateKey.length,
//                         nonce: nonce.length,
//                     });
//                     setDecryptedMessage("🔒 Encrypted (bad key/nonce)");
//                     return;
//                 }

//                 const decrypted = nacl.box.open(
//                     ciphertext,
//                     nonce,
//                     senderPublicKey,
//                     decryptedPrivateKey
//                 );

//                 if (decrypted) {
//                     const decodedText = naclUtil.encodeUTF8(decrypted);
//                     setDecryptedMessage(decodedText);
//                 } else {
//                     console.warn("⚠️ Decryption failed. Could be tampered or corrupted.");
//                     setDecryptedMessage("🔒 Encrypted (corrupt message)");
//                 }
//             } catch (error) {
//                 console.error("❌ Decryption error:", error);
//                 setDecryptedMessage("🔒 Decryption failed");
//             }
//         } else {
//             setDecryptedMessage("🔒 No message or missing key");
//         }
//     }, [data.lastMessage?.message, data.updatedAt, decryptedPrivateKey]);





//     console.log("last decrypted message", decryptedMessage);

//     return (
//         <div className="">

//             <div className={`pb-2 pt-2 pl-2 flex items-center gap-x-2  hover:bg-primaryColorLight transition-all duration-300 cursor-pointer hover:rounded-md
//             ${activeId === data?.id ? "bg-primaryColorLight rounded-md " : "bg-white"}
//             `}

//                 onClick={onClick}>
//                 <div className='w-[100%] flex items-center justify-between'>
//                     <div className="flex items-start gap-x-6">
//                         <div className="w-10 h-10">
//                             {
//                                 imagePath ? <img
//                                     src={imagePath}
//                                     alt="Client"
//                                     className="w-full h-full  rounded-full  object-fill"
//                                 /> : <UserIcon />}
//                         </div>
//                         <div>
//                             <p className={`font-[Poppins] flex  items-center  gap-x-4 capitalize  text-[14px] text-textColor  ${data?.totalUnread !== 0 ? "font-semibold" : "font-normal "}`}>
//                                 {otherUser?.fullName}
//                             </p>
//                             {decryptedMessage && (
//                                 <p className="text-xs text-gray-500 truncate max-w-[90%]">
//                                     {decryptedMessage?.slice(0, 15) + "..."}
//                                 </p>
//                             )}
//                         </div>
//                     </div>

//                 </div>
//                 {unreadCount > 0 && (
//                     <span className="bg-primaryColorDark text-white text-xs min-w-[20px] h-5 flex items-center justify-center mr-4 rounded-full px-1 leading-none aspect-square">
//                         {data.totalUnread}
//                     </span>
//                 )}


//             </div>
//         </div>
//     );
// };

// export default SingleChatData;



















