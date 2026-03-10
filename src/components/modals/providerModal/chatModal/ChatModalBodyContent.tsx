import InputField from '../../../inputField/InputField'
import Button from '../../../button/Button'
import { PiWarningCircle } from 'react-icons/pi'
import { IoIosLink } from "react-icons/io";
import { useState } from 'react';
import { toast } from 'react-toastify';
import invitationEmailApiService from '../../../../apiServices/invitationEmailApi/InvitationEmailApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputFieldOnlyRead from '../../../inputField/InputFieldOnlyRead';
import Loader from '../../../loader/Loader';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';


export const ProviderSignupSchema = z.object({
    email: z.string().email().min(1, "Email is required"),
})
type FormFields = z.infer<typeof ProviderSignupSchema>;

const ChatModalBodyContent = ({ id, chatType }: { id?: string, chatType?: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(ProviderSignupSchema),
    });

    const getChatLink = () => {
        const baseUrl = import.meta.env.VITE_ENV === "LOCALHOST"
            ? "http://localhost:5173"
            : import.meta.env.VITE_AWS_FRONT_BASE_URL;
        return `${baseUrl}/invite-chat/${chatType}/${id}`;
    };

    const sendInvitationFun = async (data: FormFields) => {
        if (!id || !chatType) return;
        setIsLoading(true);

        const payload = {
            email: data.email,
            loginUserId: loginUserId,
        };

        try {
            let response;
            if (chatType === 'group') {
                response = await messageApiService.shareGroupChatByEmail({
                    groupId: id,
                    ...payload
                });
            } else {
                response = await messageApiService.shareChatByEmail({
                    chatChannelId: id,
                    ...payload
                });
            }

            if (response) {
                setValue("email", "");
            }
        } catch (error) {
            console.error("Error sharing chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        const link = getChatLink();
        try {
            await navigator.clipboard.writeText(link);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    const handleShareGmail = () => {
        const link = getChatLink();
        const url = `mailto:?subject=Join%20me%20on%20this%20chat&body=Here%20is%20the%20link:%20${encodeURIComponent(link)}`;
        window.open(url, "_blank");
    };

    return (
        <>
            {isLoading && <Loader />}
            <div className='p-3 text-[14px] text-textGreyColor'>
                <p>Share this conversation with others. They will be able to view the chat history and join the discussion.</p>

                <div className='mt-6 flex items-center gap-x-8'>
                    <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleCopyLink}>
                        <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)]  rounded-full flex items-center justify-center bg-primaryColorDark text-white hover:bg-opacity-90 transition-all'>
                            <IoIosLink className='text-3xl' />
                        </div>
                        <p>Copy Link</p>
                    </div>
                    <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareGmail}>
                        <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-white hover:shadow-md transition-all'>
                            <img
                                src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
                                alt="Gmail"
                                className="w-9 h-9"
                            />
                        </div>
                        <p>Gmail</p>
                    </div>
                </div>

                <div className='mt-8 pt-6 border-t border-gray-100'>
                    <form className='flex items-end gap-x-4' onSubmit={handleSubmit(sendInvitationFun)}>
                        <div className='flex-1'>
                            <p className="text-textColor text-[15px] font-semibold mb-2">Share via Email</p>
                            <InputField
                                placeHolder='Enter recipient email'
                                register={register("email")}
                                error={errors.email?.message}
                            />
                        </div>
                        <div className='w-[100px] mb-[2px]'>
                            <Button text='Share' />
                        </div>
                    </form>

                    <div className='font-[Poppins] text-textGreyColor bg-teal-50 px-5 py-4 rounded-xl mt-6 flex items-start gap-x-3'>
                        <PiWarningCircle className='mt-0.5 text-teal-600' size={20} />
                        <p className='text-[13px] leading-relaxed'>
                            The recipient will receive a professionally styled email with a secure link to this chat.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatModalBodyContent;