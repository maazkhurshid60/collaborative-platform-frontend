;
import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import Loader from '../../../components/loader/Loader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import authService from '../../../apiServices/authApi/AuthApi';


type FormFields = z.infer<typeof ResetPasswordSchema>;

export interface ISigninData {
    email: string;
    password: string;
}
const ResetPassword = () => {
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(ResetPasswordSchema),
    });
    const navigate = useNavigate()
    const { token } = useParams();


    //FUNCTIONS
    const resetPasswordFunction = async (data: FormFields) => {
        if (!token) {
            toast.error("Invalid or missing token");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.resetPassword(token, data.password);
            toast.success(response?.message);
            navigate("/"); // Or wherever you want to go
        } catch (error) {
            const err = error as AxiosError<AuthErrorResponse>;
            toast.error(`${err?.response?.data?.data?.error}`);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            {isLoading && <Loader />}
            <AuthLayout heading='Reset Password'>

                <form onSubmit={handleSubmit(resetPasswordFunction)}>
                    <div className='flex items-end justify-end flex-col w-full'>

                        <div className='mb-4 w-full'>
                            <InputField label='New Password' type='password' register={register("password")} placeHolder='Enter new password.' error={errors.password?.message} />
                        </div>
                        <div className='mb-4 w-full'>
                            <InputField label='Confirm Password' type='password' register={register("confirmPassword")} placeHolder='Enter confirm password.' error={errors.confirmPassword?.message} />
                        </div>

                    </div>

                    <div className='mt-10'>

                        <Button text='Send' />
                    </div>
                </form>

            </AuthLayout>
        </>
    )
}

export default ResetPassword