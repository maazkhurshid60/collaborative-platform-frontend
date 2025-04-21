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

type FormFields = z.infer<typeof LoginSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const Login = () => {

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


        try {
            const response = await authService.login(data);
            console.log(response?.data?.user?.user?.role);
            localStorage.setItem("token", response?.data?.token)
            toast.success(response?.message);
            dispatch(saveLoginUserDetailsReducer(response?.data?.user))
            if (response?.data?.user?.user?.role === "client") {
                navigate("/documents")

            } else {

                navigate("/dashboard")
            }


        } catch (error) {

            const err = error as AxiosError<AuthErrorResponse>;
            toast.error(`${err?.response?.data?.data?.error}`);
        }
    }
    return (
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
    )
}

export default Login