;
import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import authService from '../../../apiServices/authApi/AuthApi';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';
import { AxiosError } from "axios";
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import { Client } from '../../../types/providerType/ProviderType';
import { useState } from 'react';
import Loader from '../../../components/loader/Loader';

type FormFields = z.infer<typeof LoginSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const Login = () => {
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(LoginSchema),
    });
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()


    //FUNCTIONS
    const loginFunction = async (data: FormFields) => {
        setIsLoading(true)
        try {
            const response = await authService.login(data);

            const userData = response?.data?.user;

            if (userData?.user?.status !== "active") {
                toast.error("Oops! Your account has been disabled. Contact with super admin.");
                navigate("/");
                return;
            }


            const fixedUserData = {
                ...userData,
                clientList: userData?.clientList?.map((item: Client) => item.client) || []
            };

            // Save token
            localStorage.setItem("token", response?.data?.token);

            // Login user detail data
            dispatch(saveLoginUserDetailsReducer(fixedUserData));

            toast.success(response?.message);

            // Navigate based on role
            if (userData?.user?.role === "client") {
                navigate("/documents");
            } else {
                navigate("/dashboard");
            }

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
            <AuthLayout heading='sign in'>

                <form onSubmit={handleSubmit(loginFunction)}>
                    <div className='mb-4'>
                        <InputField label='Email' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                    </div>
                    <div className='mb-4'>
                        <InputField label='Password' type='password' register={register("password")} name='password' placeHolder='Enter Password.' error={errors.password?.message} />
                    </div>
                    <div className='mt-10'>

                        <Button text='sign in' />
                    </div>

                    <p className='font-normal labelNormal  text-center mt-14'> Don’t have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/provider-signup") }}>Sign up</span></p>
                </form>

            </AuthLayout>
        </>
    )
}

export default Login