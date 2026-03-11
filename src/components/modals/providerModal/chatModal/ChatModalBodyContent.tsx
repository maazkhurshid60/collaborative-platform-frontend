import InputField from '../../../inputField/InputField';
import Button from '../../../button/Button';
import { PiWarningCircle } from 'react-icons/pi';
import { IoIosLink } from "react-icons/io";
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import InputFieldOnlyRead from '../../../inputField/InputFieldOnlyRead';
import Loader from '../../../loader/Loader';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';

const emailSchema = z.object({ email: z.string().email().min(1, "Email is required") });
type EmailForm = z.infer<typeof emailSchema>;

const ChatModalBodyContent = ({ id, chatType }: { id?: string, chatType?: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<EmailForm>({
        resolver: zodResolver(emailSchema),
    });

    const getChatLink = () => {
        const baseUrl = import.meta.env.VITE_ENV === "LOCALHOST"
            ? "http://localhost:5173"
            : import.meta.env.VITE_AWS_FRONT_BASE_URL;
        return `${baseUrl}/invite-chat/${chatType}/${id}`;
    };

    const sendInvitationFun = async (data: EmailForm) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const resp = await messageApiService.shareGroupChatByEmail({ groupId: id, email: data.email, loginUserId });
            setValue('email', '');
            toast.success(resp?.message || 'Action completed successfully');
        } catch (error: any) {
            console.error("Error sharing chat:", error);
            const errorMsg = error?.response?.data?.message || 'Failed to share group chat';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        const link = generatedUrl || getChatLink();
        try {
            await navigator.clipboard.writeText(link);
            toast.success("Link copied to clipboard!");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                {/* Only Individual Chat Shows Just Link/Gmail at top */}
                {chatType !== 'group' && (
                    <>
                        <p>Your Details and any messages you add after sharing stay private. You will need to update the link after adding more message to this chat.</p>
                        <div className='mt-5 flex items-center justify-baseline gap-x-3'>
                            <div className='relative flex-1'>
                                <InputFieldOnlyRead value={generatedUrl} placeHolder='Create Link' />
                            </div>
                            <button type='button' onClick={() => setGeneratedUrl(getChatLink())} className='h-[40px] px-5 rounded-lg bg-primaryColorDark cursor-pointer text-white text-[13px] font-semibold hover:bg-opacity-90 transition-all shrink-0'>Create</button>
                        </div>
                        <div className='mt-6 flex items-center gap-x-8'>
                            <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleCopyLink}>
                                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)]  rounded-full flex items-center justify-center bg-primaryColorDark text-white hover:bg-opacity-90 transition-all'>
                                    <IoIosLink className='text-3xl' />
                                </div>
                                <p>Copy Link</p>
                            </div>
                            <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareGmail}>
                                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-white hover:shadow-md transition-all'>
                                    <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="Gmail" className="w-9 h-9" />
                                </div>
                                <p>Gmail</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Group Chat Share Layout */}
                {chatType === 'group' && (
                    <div className='mt-2'>
                        <p className='mb-4'>Share this chat by generating a link</p>
                        <div className='flex items-center justify-baseline gap-x-3'>
                            <div className='relative flex-1'>
                                <InputFieldOnlyRead value={generatedUrl} placeHolder='Create Link' />
                            </div>
                            <button type='button' onClick={() => setGeneratedUrl(getChatLink())} className='h-[40px] px-5 rounded-lg bg-primaryColorDark cursor-pointer text-white text-[13px] font-semibold hover:bg-opacity-90 transition-all shrink-0'>Create</button>
                        </div>

                        <div className='mt-6 flex items-center gap-x-8'>
                            <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleCopyLink}>
                                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)]  rounded-full flex items-center justify-center bg-primaryColorDark text-white hover:bg-opacity-90 transition-all'>
                                    <IoIosLink className='text-3xl' />
                                </div>
                                <p>Copy Link</p>
                            </div>
                            <div className='flex flex-col items-center justify-center cursor-pointer' onClick={handleShareGmail}>
                                <div className='w-14 h-14 mb-2 shadow-[0_0_14px_0_rgba(0,0,0,0.1)] rounded-full flex items-center justify-center bg-white hover:shadow-md transition-all'>
                                    <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="Gmail" className="w-9 h-9" />
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
                )}
            </div>
        </>
    );
};

export default ChatModalBodyContent;