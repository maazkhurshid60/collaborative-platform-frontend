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
import Dropdown from '../../../components/dropdown/Dropdown';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { useEffect, useState } from 'react';
import clientApiService from '../../../apiServices/clientApi/ClientApi';
import { emptyResult } from '../../../redux/slices/LoginUserDetailSlice';
import Loader from '../../../components/loader/Loader';
import CountryStateSelect from '../../../components/dropdown/CountryStateSelect';
import HipaaModal from '../../../components/modals/HipaaModal/HipaaModal';

type FormFields = z.infer<typeof ClientSignupSchema>;

const ClientSignup = () => {
    const licenseNoData = useSelector((state: RootState) => state.LoginUserDetail.licenseNoResult);
    const [isLoading, setIsLoading] = useState(false);
    const [showHipaaModal, setShowHipaaModal] = useState(false);
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
            gender: data.gender || licenseNoData.gender?.toLowerCase() || undefined,
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
        if (licenseNoData?.gender) {
            setValue("gender", licenseNoData.gender.toLowerCase(), { shouldValidate: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [licenseNoData]);

    return (
        <>
            {isLoading && <Loader />}
            {showHipaaModal && <HipaaModal onClose={() => setShowHipaaModal(false)} />}
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
                        <div className='mb-3.5'>
                            <Dropdown<FormFields>
                                disable={isLicenseFound}
                                name="gender"
                                control={methods.control}
                                label="Gender"
                                options={[
                                    { value: "male", label: "Male" },
                                    { value: "female", label: "Female" },
                                    { value: "prefer_not_to_say", label: "Prefer not to say" },
                                ]}
                                placeholder="Choose an option"
                                error={errors.gender?.message}
                            />
                        </div>
                        {/* License Number input removed */}
                        <CountryStateSelect disable={isLicenseFound} isStateView={false} />
                        <CountryStateSelect disable={isLicenseFound} isStateView={true} />
                        <div className='mb-3.5'>
                            <InputField required label='Password' type='password' register={register("password")} placeHolder='Enter Password' error={errors?.password?.message} />
                            <p className="text-xs text-gray-500 mt-1 leading-tight">
                                Min 10 chars, including 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                            </p>
                        </div>
                        <div className='mb-3.5'>
                            <InputField required label='Confirm Password' type='password' register={register("confirmPassword")} placeHolder='Enter Confirm Password' error={errors?.confirmPassword?.message} />
                        </div>

                        {/* ── HIPAA Consent ── */}
                        <div className="mt-4 mb-2">
                            <label htmlFor="client-hipaa-consent" className="flex items-start gap-3 cursor-pointer">
                                <span className="relative flex-shrink-0 mt-0.5">
                                    <input
                                        id="client-hipaa-consent"
                                        type="checkbox"
                                        className="peer sr-only"
                                        {...register("hipaaConsent")}
                                    />
                                    <span className="block w-5 h-5 rounded-[5px] border-2 border-gray-300 bg-white peer-checked:bg-[#0d9488] peer-checked:border-[#0d9488] transition-all shadow-sm">
                                        <svg className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                </span>
                                <span className="text-sm text-gray-600 leading-relaxed select-none">
                                    I consent to and agree with the{" "}
                                    <button
                                        type="button"
                                        onClick={() => setShowHipaaModal(true)}
                                        className="text-[#0d9488] font-semibold underline underline-offset-2 hover:text-teal-700 transition-colors"
                                    >
                                        HIPAA Compliance Terms
                                    </button>
                                    . I understand my obligations regarding protected health information (PHI).
                                </span>
                            </label>
                            {errors.hipaaConsent && (
                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.hipaaConsent.message}
                                </p>
                            )}
                        </div>

                        <div className='mt-6'>
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
