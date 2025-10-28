;
import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Loader from '../../../components/loader/Loader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import authService from '../../../apiServices/authApi/AuthApi';


type FormFields = z.infer<typeof ForgotPasswordSchema>;

export interface ISigninData {
    email: string;
    password: string;
}
const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(ForgotPasswordSchema),
    });
    const navigate = useNavigate()



    //FUNCTIONS
    const loginFunction = async (data: FormFields) => {

        setIsLoading(true)
        try {
            const response = await authService.forgotPassword(data.email);

            const userData = response?.data?.user;

            if (userData?.status !== "active") {
                toast.error("Oops! Your account has been disabled. Contact with super admin.");
                navigate("/");
                return;
            }
            // navigate("/reset-password");
            toast.success(response?.message);


        } catch (error) {
            const err = error as AxiosError<AuthErrorResponse>;
            toast.error(`${err?.response?.data?.data?.error}`);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <>
            {isLoading && <Loader />}
            <AuthLayout heading='Forgot Password'>

                <form onSubmit={handleSubmit(loginFunction)}>
                    <div className='flex items-end justify-end flex-col w-full'>

                        <div className='mb-4 w-full'>
                            <InputField label='Email' register={register("email")} placeHolder='Enter Email for new password.' error={errors.email?.message} />
                        </div>

                    </div>

                    <div className='mt-10'>

                        <Button text='Send' />
                    </div>

                    <p className='font-normal labelNormal  text-center mt-14'> Don’t have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/provider-signup") }}>Sign up</span></p>
                </form>

            </AuthLayout>
        </>
    )
}

export default ForgotPassword