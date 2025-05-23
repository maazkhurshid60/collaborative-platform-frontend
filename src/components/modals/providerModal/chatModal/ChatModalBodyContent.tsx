import InputField from '../../../inputField/InputField'
import Button from '../../../button/Button'
import { PiWarningCircle } from 'react-icons/pi'
import { FaWhatsapp } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";
import { FaInstagram } from 'react-icons/fa'
import { FaFacebookF } from "react-icons/fa";
import { useState } from 'react';
import { toast } from 'react-toastify';

const ChatModalBodyContent = ({ id, chatType }: { id?: string, chatType?: string }) => {
    const [generatedLink, setGeneratedLink] = useState('');

    const handleGenerateLink = () => {
        // const dummyLink = `http://localhost:5173/invite-chat/${chatType}/${id}`;
        const dummyLink = `https://collaborative-platform-backend.onrender.com/invite-chat/${chatType}/${id}`;
        setGeneratedLink(dummyLink);
    };

    const handleCopyLink = async () => {
        if (!generatedLink) return alert("Please generate the link first.");
        try {
            await navigator.clipboard.writeText(generatedLink);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };
    return <div className='p-3 text-[14px] text-textGreyColor'>
        <p>Your Details and any messages you add after sharing stay private. You will need to update the link after adding more message to this chat.</p>
        <div className='flex items-center gap-x-6 mt-6'>
            <div className='w-[100%]    '>
                <InputField placeHolder='Create Link' value={generatedLink} readOnly />
            </div>
            <div className='w-[100px]'>

                <Button text='Create' onclick={handleGenerateLink} />
            </div>
        </div>
        <div className='mt-6 flex items-center gap-x-8'>
            <div className='flex flex-col items-center justify-center' onClick={handleCopyLink}>
                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)]  rounded-full flex items-center justify-center bg-primaryColorDark text-white'>
                    <IoIosLink className='text-3xl' />
                </div>
                <p>Copy Link</p>
            </div>
            <div className='flex flex-col items-center justify-center'>

                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-white'>
                    <img
                        src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
                        alt="Gmail"
                        className="w-9 h-9"
                    />
                </div>
                <p>Gmail</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-[#25D366] text-white'>
                    <FaWhatsapp className='text-4xl' />
                </div>
                <p>Whatsapp</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
                <div className="w-14 h-14 mb-2 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                    <FaInstagram className="text-white text-4xl" />
                </div>
                <p>Instagram</p>
            </div>
            <div className='flex flex-col items-center justify-center'>
                <div className="w-14 h-14 mb-2 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <FaFacebookF className="text-white text-4xl" />
                </div>
                <p>Facebook</p>
            </div>
        </div>
        <div className='flex items-end gap-x-6 mt-6'>
            <div className='w-[100%]    '>
                <p className="text-textColor text-[16px] font-[Poppins] font-semibold mb-1">Invite People </p>
                <InputField placeHolder='user@gmail.com' />
            </div>
            <div className='w-[100px]'>

                <Button text='Invite' />
            </div>
        </div>

        <div className='font-[Poppins] text-textGreyColor  bg-[#EAF5F4] px-6 py-4 rounded-lg mt-6 flex items-center gap-x-4'>
            <PiWarningCircle className='rotate-180' size={24} />
            <p className=''> You can also send invite to people for joining you on this platform.</p>
        </div>
    </div>


}

export default ChatModalBodyContent