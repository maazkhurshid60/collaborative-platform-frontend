import InputField from '../../../inputField/InputField'
import Button from '../../../button/Button'
import { PiWarningCircle } from 'react-icons/pi'
import { FaWhatsapp } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";
import { FaInstagram } from 'react-icons/fa'
import { FaFacebookF } from "react-icons/fa";
import { useState } from 'react';
import { toast } from 'react-toastify';
import invitationEmailApiService from '../../../../apiServices/invitationEmailApi/InvitationEmailApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


export const ProviderSignupSchema = z.object({
    email: z.string().email().min(1, "Email is required"),
})
type FormFields = z.infer<typeof ProviderSignupSchema>;

const ChatModalBodyContent = ({ id, chatType }: { id?: string, chatType?: string }) => {
    const {
        register,
        handleSubmit, setValue,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(ProviderSignupSchema),
    });
    const [generatedLink, setGeneratedLink] = useState('');
    const providerName = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.fullName)
    const handleGenerateLink = () => {
        const dummyLink = `${import.meta.env.VITE_VERCEL_BASE_URL}/invite-chat/${chatType}/${id}`;
        setGeneratedLink(dummyLink);
    };


    const sendInvitationFun = async (data: FormFields) => {
        const dataSendToBack = {
            invitationEmail: data?.email, providerName: providerName
        }
        const response = await invitationEmailApiService.sendInvitationEmailApiService(dataSendToBack)

        toast.success(`${response.data.message}`)
        setValue("email", "")

    }

    const handleCopyLink = async () => {
        if (!generatedLink) return toast.error("Please generate the link first.");
        try {
            await navigator.clipboard.writeText(generatedLink);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };


    const handleShareWhatsApp = () => {
        if (!generatedLink) return toast.error("Generate the link first.");
        const url = `https://wa.me/?text=${encodeURIComponent(generatedLink)}`;
        window.open(url, "_blank");
    };

    const handleShareFacebook = () => {
        if (!generatedLink) return toast.error("Generate the link first.");
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}`;
        window.open(url, "_blank");
    };

    const handleShareGmail = () => {
        if (!generatedLink) return toast.error("Generate the link first.");
        const url = `mailto:?subject=Join%20me%20on%20this%20chat&body=Here%20is%20the%20link:%20${encodeURIComponent(generatedLink)}`;
        window.open(url, "_blank");
    };

    const handleShareInstagram = () => {
        toast.info("Instagram does not support direct link sharing.");
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
            <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleCopyLink}>
                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)]  rounded-full flex items-center justify-center bg-primaryColorDark text-white'>
                    <IoIosLink className='text-3xl' />
                </div>
                <p>Copy Link</p>
            </div>
            <div className='flex flex-col items-center justify-center  cursor-pointer'>

                <div onClick={handleShareGmail} className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-white'>
                    <img
                        src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
                        alt="Gmail"
                        className="w-9 h-9"
                    />
                </div>
                <p>Gmail</p>
            </div>
            <div className='flex flex-col items-center justify-center  cursor-pointer'>
                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-[#25D366] text-white'>
                    <FaWhatsapp className='text-4xl' onClick={handleShareWhatsApp} />
                </div>
                <p>Whatsapp</p>
            </div>
            <div className='flex flex-col items-center justify-center  cursor-pointer'>
                <div className="w-14 h-14 mb-2 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                    <FaInstagram className="text-white text-4xl" onClick={handleShareInstagram} />
                </div>
                <p>Instagram</p>
            </div>
            <div className='flex flex-col items-center justify-center  cursor-pointer'>
                <div className="w-14 h-14 mb-2 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <FaFacebookF className="text-white text-4xl" onClick={handleShareFacebook} />
                </div>
                <p>Facebook</p>
            </div>
        </div>
        <form className='flex items-end gap-x-6 mt-6' onSubmit={handleSubmit(sendInvitationFun)}>
            <div className='w-[100%]    '>
                <p className="text-textColor text-[16px] font-[Poppins] font-semibold mb-1">Invite People </p>
                <InputField placeHolder='user@gmail.com' register={register("email")} name='email' error={errors.email?.message} />
            </div>
            <div className='w-[100px]'>

                <Button text='Invite' />
            </div>
        </form>

        <div className='font-[Poppins] text-textGreyColor  bg-[#EAF5F4] px-6 py-4 rounded-lg mt-6 flex items-center gap-x-4'>
            <PiWarningCircle className='rotate-180' size={24} />
            <p className=''> You can also send invite to people for joining you on this platform.</p>
        </div>
    </div>


}

export default ChatModalBodyContent