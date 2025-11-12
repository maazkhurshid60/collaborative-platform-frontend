import { useForm, FormProvider } from 'react-hook-form';
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
import CountryStateSelect from '../../../components/dropdown/CountryStateSelect';

type FormFields = z.infer<typeof ClientSignupSchema>;

const ClientSignup = () => {
    const licenseNoData = useSelector((state: RootState) => state.LoginUserDetail.licenseNoResult);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const methods = useForm<FormFields>({
        resolver: zodResolver(ClientSignupSchema),
    });

    const { register, handleSubmit, formState: { errors }, setValue } = methods;

    const signupFunction = async (data: FormFields) => {
        setIsLoading(true);

        const dataSendToBackend = {
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            licenseNo: data.licenseNo,
            country: data.country,
            state: data.state,
            role: "client",
            isAccountCreatedByOwnClient: true,
            age: licenseNoData.age ?? undefined,
            contactNo: licenseNoData.contactNo ?? undefined,
            address: licenseNoData.address ?? undefined,
            gender: licenseNoData.gender ?? undefined,
            status: licenseNoData.status ?? undefined,
            clientId: licenseNoData.clientId,
            isApprove: licenseNoData.isApprove
        };



        try {
            const response = licenseNoData.isClientExist
                ? await clientApiService.updateExistingClientApi(dataSendToBackend)
                : await authService.signup({ ...dataSendToBackend, isApprove: "pending" });

            toast.success(response?.message);
            dispatch(emptyResult());
            navigate("/");
        } catch (error) {
            const err = error as AxiosError<AuthErrorResponse>;
            toast.error(`${err?.response?.data?.data?.error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setValue("fullName", licenseNoData?.fullName);
        setValue("licenseNo", licenseNoData?.licenseNo);
        setValue("email", licenseNoData?.email);
    }, [licenseNoData]);

    return (
        <>
            {isLoading && <Loader />}
            <AuthLayout heading="Sign up">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(signupFunction)}>
                        <div className='mb-3.5'>
                            <InputField required label='Full Name' register={register("fullName")} placeHolder='Enter Full Name' error={errors?.fullName?.message} />
                        </div>
                        <div className='mb-3.5'>
                            <InputField required label='Email ID' register={register("email")} placeHolder='Enter Email' error={errors?.email?.message} />
                        </div>
                        <div className='mb-3.5'>
                            <InputField required label='License Number' type='number' register={register("licenseNo")} placeHolder='Enter License Number' error={errors?.licenseNo?.message} />
                        </div>
                        <CountryStateSelect isCountryView={true} isStateView={false} defaultCountry={licenseNoData?.country} />
                        <CountryStateSelect isCountryView={false} isStateView={true} defaultState={licenseNoData?.state} />
                        <div className='mb-3.5'>
                            <InputField required label='Password' type='password' register={register("password")} placeHolder='Enter Password' error={errors?.password?.message} />
                        </div>
                        <div className='mb-3.5'>
                            <InputField required label='Confirm Password' type='password' register={register("confirmPassword")} placeHolder='Enter Confirm Password' error={errors?.confirmPassword?.message} />
                        </div>



                        <div className='mt-10'>
                            <Button text='Sign up' />
                        </div>

                        <p className='font-normal labelNormal text-center mt-8'>
                            Already have an account?
                            <span className='capitalize ml-1 text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/"); dispatch(emptyResult()) }}>
                                Sign in
                            </span>
                            or
                            <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/signup-with-license"); dispatch(emptyResult()) }}> Enter license number</span>
                        </p>
                    </form>
                </FormProvider>
            </AuthLayout>
        </>
    );
};

export default ClientSignup;
