import { useForm, FormProvider } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { string, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientSignupSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate, useLocation } from 'react-router-dom';
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

    const isLicenseFound = !!licenseNoData?.licenseNo
    const location = useLocation();

    useEffect(() => {
        if (!location.state?.fromLicense) {
            dispatch(emptyResult());
        }
    }, [dispatch, location.state]);

    const signupFunction = async (data: FormFields) => {
        setIsLoading(true);

        const dataSendToBackend = {
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            //    country: data.country,
            state: data.state,
            role: "client",
            isAccountCreatedByOwnClient: true,
            age: licenseNoData.age ?? undefined,
            contactNo: licenseNoData.contactNo ?? undefined,
            address: licenseNoData.address ?? undefined,
            gender: licenseNoData.gender?.toLowerCase() ?? undefined,
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
        setValue("fullName", licenseNoData?.fullName, { shouldValidate: true });
        setValue("email", licenseNoData?.email, { shouldValidate: true });
        // if (licenseNoData?.country) {
        //     setValue("country", licenseNoData.country as "US", { shouldValidate: true });
        // }
        if (licenseNoData?.state) {
            setValue("state", licenseNoData.state, { shouldValidate: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [licenseNoData]);

    return (
        <>
            {isLoading && <Loader />}
            <AuthLayout heading="Sign up">
                {isLicenseFound && (
                    <div className="text-center mb-6">
                        <p className="text-[#0d9488] font-medium text-sm bg-[#ccfbf1] p-3 rounded-md">
                            Complete your account setup to access the documents shared with you.
                        </p>
                    </div>
                )}
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(signupFunction)}>
                        <div className='mb-3.5'>
                            <InputField disabled={isLicenseFound} required label='Full Name' register={register("fullName")} placeHolder='Enter Full Name' error={errors?.fullName?.message} />
                            <p className="text-xs text-gray-500 mt-1">
                                Letters, spaces, hyphens and apostrophes only.
                            </p>
                        </div>
                        <div className='mb-3.5'>
                            <InputField disabled={isLicenseFound} required label='Email ID' register={register("email")} placeHolder='Enter Email' error={errors?.email?.message} />
                        </div>
                        {/* License Number input removed */}
                        <CountryStateSelect disable={isLicenseFound} isStateView={false} />
                        <CountryStateSelect disable={isLicenseFound} isStateView={true}
                        // defaultState={licenseNoData?.state} 
                        />
                        <div className='mb-3.5'>
                            <InputField required label='Password' type='password' register={register("password")} placeHolder='Enter Password' error={errors?.password?.message} />
                            <p className="text-xs text-gray-500 mt-1 leading-tight">
                                Min 10 chars, including 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                            </p>
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
                            <span className='capitalize text-greenColor underline font-bold cursor-pointer ml-1' onClick={() => { navigate("/signup-with-client-id"); dispatch(emptyResult()) }}> Enter Client ID</span>
                        </p>
                    </form>
                </FormProvider>
            </AuthLayout>
        </>
    );
};

export default ClientSignup;
