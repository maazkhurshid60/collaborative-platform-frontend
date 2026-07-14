import InputField from '../../../inputField/InputField';
import Button from '../../../button/Button';
import { PiWarningCircle } from 'react-icons/pi';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import messageApiService from '../../../../apiServices/chatApi/messagesApi/MessagesApi';
import Loader from '../../../loader/Loader';

const emailSchema = z.object({ email: z.string().email().min(1, "Email is required") });
type EmailForm = z.infer<typeof emailSchema>;

const InviteToGroupModalBody = ({ id }: { id?: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.userId);
    const queryClient = useQueryClient();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<EmailForm>({
        resolver: zodResolver(emailSchema),
    });

    const sendInvitationFun = async (data: EmailForm) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const resp = await messageApiService.shareGroupChatByEmail({ groupId: id, email: data.email, loginUserId });
            setValue('email', '');
            toast.success(resp?.message || 'Action completed successfully');

            // Invalidate queries to refresh the group member list and chat list
            queryClient.invalidateQueries({ queryKey: ['groupChatchannels'] });
            queryClient.invalidateQueries({ queryKey: ['chatchannels'] });
        } catch (error: any) {
            console.error("Error sharing chat:", error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to share group chat';
            if (error?.response?.status === 409) {
                toast.warn(errorMsg);
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className='p-6'>
                <form onSubmit={handleSubmit(sendInvitationFun)}>
                    <p className="text-textColor text-[15px] font-semibold mb-2">Invite via Email</p>
                    <div className='flex items-start gap-x-4'>
                        <div className='flex-1'>
                            <InputField
                                placeHolder='Enter recipient email'
                                register={register("email")}
                                error={errors.email?.message}
                                disabled={isLoading}
                            />
                        </div>
                        <div className='w-[100px] h-[100px]'>
                            <Button
                                text='Invite'
                                isLoading={isLoading}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </form>

                <div className='font-[Poppins] text-textGreyColor bg-teal-50 px-5 py-4 rounded-xl mt-6 flex items-start gap-x-3'>
                    <PiWarningCircle className='mt-0.5 text-teal-600' size={20} />
                    <p className='text-[13px] leading-relaxed'>
                        The recipient will receive a professionally styled email with a secure link to this chat.
                        They will be able to join the group directly from the email.
                    </p>
                </div>
            </div>
        </>
    );
};

export default InviteToGroupModalBody;
