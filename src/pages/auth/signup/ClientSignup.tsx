import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSignupSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../../apiServices/authApi/AuthApi';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { useEffect, useState } from 'react';
import clientApiService from '../../../apiServices/clientApi/ClientApi';
import { emptyResult } from '../../../redux/slices/LoginUserDetailSlice';
import Loader from '../../../components/loader/Loader';

type FormFields = z.infer<typeof ClientSignupSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}

const ClientSignup = () => {
    const cnicData = useSelector((state: RootState) => state.LoginUserDetail.cnicResult)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }, setValue
    } = useForm<FormFields>({
        resolver: zodResolver(ClientSignupSchema),
    });
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    //FUNCTIONS
    const signupFunction = async (data: FormFields) => {
        setIsLoading(true)

        if (cnicData.isClientExist) {
            const dataSendToBackend = {
                email: data?.email,
                password: data?.password,
                fullName: data?.fullName,
                cnic: data?.cnic,
                role: "client",
                isAccountCreatedByOwnClient: true,
                age: cnicData.age ?? undefined,
                contactNo: cnicData.contactNo ?? undefined,
                address: cnicData.address ?? undefined,
                gender: cnicData.gender ?? undefined,
                status: cnicData.status ?? undefined,
                clientId: cnicData.clientId
            };
            try {
                const response = await clientApiService.updateExistingClientApi(dataSendToBackend);
                toast.success(response?.message);
                dispatch(emptyResult())
                navigate("/")
            } catch (error) {
                const err = error as AxiosError<AuthErrorResponse>;
                toast.error(`${err?.response?.data?.data?.error}`);
            } finally {
                setIsLoading(false)

            }
        }
        else {
            setIsLoading(true)

            const dataSendToBackend = { email: data?.email, password: data?.password, fullName: data?.fullName, cnic: data?.cnic, role: "client", isAccountCreatedByOwnClient: true };
            try {
                const response = await authService.signup(dataSendToBackend);
                toast.success(response?.message);
                navigate("/")
            } catch (error) {
                const err = error as AxiosError<AuthErrorResponse>;
                toast.error(`${err?.response?.data?.data?.error}`);
            } finally {
                setIsLoading(false)

            }
        }
    }

    useEffect(() => {
        setValue("fullName", cnicData?.fullName)
        setValue("cnic", cnicData?.cnic)
        setValue("email", cnicData?.email)


    }, [cnicData])
    return (
        <>
            {isLoading && <Loader />}
            <AuthLayout heading="Sign up">
                <form onSubmit={handleSubmit(signupFunction)}>
                    <div className='mb-3.5'>
                        <InputField required
                            label='Full Name'
                            register={register("fullName")}
                            name='fullName'
                            placeHolder='Enter Full Name.'
                            error={errors?.fullName?.message} />
                    </div>
                    <div className='mb-3.5'>
                        <InputField required
                            label='Email ID'
                            register={register("email")}
                            name='email'
                            placeHolder='Enter Email.'
                            error={errors?.email?.message} />
                    </div>
                    <div className='mb-3.5'>
                        <InputField required
                            label='CNIC No'
                            register={register("cnic")}
                            name='cnic' placeHolder='Enter CNIC.'
                            error={errors?.cnic?.message} />
                    </div>
                    <div className='mb-3.5'>
                        <InputField required
                            label='Password'
                            type='password'
                            register={register("password")}
                            name='password'
                            placeHolder='Enter Password.'
                            error={errors?.password?.message} />
                    </div>
                    <div className='mb-3.5'>
                        <InputField required
                            label='Confirm Password'
                            type='password'
                            register={register("confirmPassword")}
                            name='confirmPassword'
                            placeHolder='Enter Confirm Password.'
                            error={errors?.confirmPassword?.message} />
                    </div>
                    <div className='mt-10'>
                        <Button
                            text='sign up' />
                    </div>

                    <p className='font-normal labelNormal  text-center mt-14'>
                        Don’t have an account? <span className='capitalize ml-1 text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/"); dispatch(emptyResult()) }}>
                            Sign in
                        </span>
                        or <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/signup-with-cnic"); dispatch(emptyResult()) }}> Enter CNIC Number</span>
                    </p>
                </form>

            </AuthLayout >
        </>
    )
}

export default ClientSignup
