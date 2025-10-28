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
import { saveDecryptedPrivateKey, saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';

import { Client } from '../../../types/providerType/ProviderType';
import { useCallback, useState } from 'react';
import Loader from '../../../components/loader/Loader';
import { NavLink } from 'react-router-dom';
import { isAxiosErrorWithAuthData } from '../../../utils/TypeGuard';
import naclUtil from 'tweetnacl-util';
import CryptoJS from 'crypto-js';

type FormFields = z.infer<typeof LoginSchema>;

export interface ISigninData {
    email: string;
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
    const loginFunction = useCallback(async (data: FormFields) => {
        setIsLoading(true)
        try {
            const response = await authService.login(data);

            const userData = response?.data?.user;
            if (userData?.user?.isApprove === "pending") {
                toast.error("Your account has not been approved or verified by the super admin yet. Please check your email for the verification link.");
                navigate("/");
                return;
            }
            if (userData?.user?.isApprove === "reject") {
                toast.error("Your account has been reject by the super admin yet. Please contact with super admin.");
                navigate("/");
                return;
            }
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
            const encryptedPrivateKey = userData?.user?.privateKey;
            console.log("encryptedPrivateKey", encryptedPrivateKey);

            if (encryptedPrivateKey) {
                const decryptedKeyString = CryptoJS.AES.decrypt(encryptedPrivateKey, data.password).toString(CryptoJS.enc.Utf8);
                const decryptedPrivateKeyUint8 = naclUtil.decodeBase64(decryptedKeyString);
                console.log("decryptedPrivateKeyUint8", decryptedPrivateKeyUint8);

                // dispatch(saveDecryptedPrivateKey(decryptedPrivateKeyUint8));

                const base64Key = naclUtil.encodeBase64(decryptedPrivateKeyUint8); // Convert to string
                dispatch(saveDecryptedPrivateKey(base64Key));
            }


            // Login user detail data
            dispatch(saveLoginUserDetailsReducer(fixedUserData));

            toast.success(response?.message);


            // Navigate based on role
            navigateToRoleDashboard(userData?.user?.role)



        } catch (error) {
            if (isAxiosErrorWithAuthData(error)) {
                toast.error(error?.response?.data.data.error);
            } else {
                toast.error("Unexpected error occurred.");
            }
        } finally {
            setIsLoading(false)
        }
    }, [dispatch, navigate]);


    const navigateToRoleDashboard = (role: string) => {
        if (role === "client") return navigate("/documents");
        if (role === "superadmin") return navigate("/pending-users");
        return navigate("/dashboard");
    }

    return (
        <>
            {isLoading && <Loader />}
            <AuthLayout heading='sign in'>

                <form onSubmit={handleSubmit(loginFunction)}>
                    <div className='flex items-end justify-end flex-col w-full'>

                        <div className='mb-4 w-full'>
                            <InputField label='Email' register={register("email")} placeHolder='Enter Email.' error={errors.email?.message} />
                        </div>
                        <div className='mb-4 w-full'>
                            <InputField label='Password' type='password' register={register("password")} placeHolder='Enter Password.' error={errors.password?.message} />
                        </div>
                        <NavLink to="/forgot-password" className='text-primaryColorDark text-sm'>Forgot Password</NavLink>
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