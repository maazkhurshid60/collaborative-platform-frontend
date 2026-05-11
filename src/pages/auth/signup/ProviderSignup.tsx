import { FormProvider, useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProviderSignupSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../../../components/dropdown/Dropdown';
import authService from '../../../apiServices/authApi/AuthApi';
import { toast } from 'react-toastify';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import Loader from '../../../components/loader/Loader';
import CountryStateSelect from '../../../components/dropdown/CountryStateSelect';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import CryptoJS from 'crypto-js';
import { RootState } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { addDataNewJoinUserReducer, emptyDataNewJoinUserReducer } from '../../../redux/slices/JoinNowUserSlice';
import { saveDecryptedPrivateKey, saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';
import messageApiService, { updateGroupApiType } from '../../../apiServices/chatApi/messagesApi/MessagesApi';
import HipaaModal from '../../../components/modals/HipaaModal/HipaaModal';

export const specialityOptions = [
    { value: "Psychiatry", label: "Psychiatry" },
    { value: "Psychology", label: "Psychology" },
    { value: "Therapy / Counseling", label: "Therapy / Counseling" },
    { value: "Social Work", label: "Social Work" },
    { value: "Primary Care", label: "Primary Care" },
    { value: "Family Medicine", label: "Family Medicine" },
    { value: "Internal Medicine", label: "Internal Medicine" },
    { value: "Cardiology", label: "Cardiology" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "Neurology", label: "Neurology" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Obstetrics & Gynecology (OB/GYN)", label: "Obstetrics & Gynecology (OB/GYN)" },
    { value: "Nutrition / Dietetics", label: "Nutrition / Dietetics" },
    { value: "Physical Therapy", label: "Physical Therapy" },
    { value: "Occupational Therapy", label: "Occupational Therapy" },
    { value: "Speech Therapy", label: "Speech Therapy" },
    { value: "Other", label: "Other" },
]
type FormFields = z.infer<typeof ProviderSignupSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const ProviderSignup = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const [isLoading, setIsLoading] = useState(false)
    const joinUser = useSelector((state: RootState) => state?.joinUserSlice?.data)
    const [invitedByName, setInvitedByName] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showHipaaModal, setShowHipaaModal] = useState(false);

    const methods = useForm<FormFields>({
        resolver: zodResolver(ProviderSignupSchema),
        mode: "onChange",
        criteriaMode: "all"
    });

    const { register, handleSubmit, formState: { errors }, setValue, control } = methods;
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // 1️⃣ Verify token on mount and pre-fill email
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                setIsLoading(true);
                try {
                    const response = await authService.verifyInvitation(token);
                    if (response?.data?.email) {
                        setValue("email", response.data.email);
                        setInvitedByName(response.data.invitedByName);
                        setIsVerified(true);
                    }
                } catch (error: any) {
                    console.error("Invitation verification failed", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (joinUser?.memberEmail) {
            setValue("email", joinUser.memberEmail);
            setIsVerified(true);
        } else {
            verifyToken();
        }
    }, [token, setValue, joinUser]);

    // 2️⃣ Signup Function
    const signupFunction = async (data: FormFields) => {
        setIsLoading(true);

        try {
            const response = await authService.checkEmail(data.email, data.licenseNo);

            if (response?.data?.exists) {
                setIsLoading(false);
                toast.error("Email is already registered");
                return;
            }
        } catch (error: any) {
            setIsLoading(false);

            if (error?.response?.status === 429) {
                toast.error("Too Many Request Please Try again later");
                return;
            }

            if (error?.response?.status === 409) {
                const field = error.response.data?.data?.field || "Email";
                toast.error(`${field} is already registered`);
                return;
            }

            // Handle other errors
            console.error("Email check error:", error);
            toast.error("Please Enter Valid Email address");
            return;
        }

        const keyPair = nacl.box.keyPair();
        const publicKey = naclUtil.encodeBase64(keyPair.publicKey);
        const privateKey = naclUtil.encodeBase64(keyPair.secretKey);
        const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, data.password).toString();

        const dataSendToBackend = {
            email: data.email,
            fullName: data.fullName,
            gender: data.gender,
            password: data.password,
            licenseNo: data.licenseNo,
            speciality: data.speciality === "Other" ? (data.otherSpeciality || "Other") : data.speciality,
            //         country: data.country,
            state: data.state,
            isApprove: "pending",
            role: "provider",
            publicKey: publicKey,
            privateKey: encryptedPrivateKey,
            inviteToken: token || undefined,
        };


        // If invited (has token), go to confirm-free-account
        // We also pass inviteToken in state so the user can later navigate to select-plan
        // and have their invite context preserved throughout.
        if (token) {
            setIsLoading(false);
            navigate("/confirm-free-account", {
                state: {
                    userData: dataSendToBackend,
                    planType: 'FREE',
                    inviteToken: token, // ✅ preserve so "View Plans" detour works
                }
            });
            return;
        }

        // Normal flow: navigate to select-plan
        setIsLoading(false);
        navigate("/select-plan", { state: { userData: dataSendToBackend } });
    }


    const updateGroupApi = async (dataSendToBack: updateGroupApiType) => {
        try {
            const response = await messageApiService.updateGroupApi(dataSendToBack)
            toast.success('You have joined the group. Please login to continue.')
        } catch (err) {

            let errorMessage = "Error loading messages.";

            if (err instanceof Error) {
                errorMessage = err.message;
            }
            else if (typeof err === "string") {
                errorMessage = err;
            }

            toast.error(errorMessage);

            const newJoinDataSendToBack = { ...dataSendToBack, isNewJoin: true }
            dispatch(addDataNewJoinUserReducer(newJoinDataSendToBack))
        }
    }


    return (
        <>
            {isLoading && <Loader />}
            {showHipaaModal && <HipaaModal onClose={() => setShowHipaaModal(false)} />}
            <AuthLayout heading="Sign up" currentStep={1} totalSteps={2}>
                <FormProvider {...methods}>

                    <form onSubmit={handleSubmit(signupFunction)}>
                        {invitedByName && (
                            <p className="text-sm text-greenColor mb-4 text-center">
                                Invited by <b>{invitedByName}</b>
                            </p>
                        )}
                        <div className='mb-1.5'>
                            <InputField required label='Full Name' register={register("fullName")} placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                            <p className="text-xs text-gray-500 mt-1">
                                Letters, spaces, hyphens and apostrophes only.
                            </p>
                        </div>
                        <div className='mb-1.5'>
                            <InputField required label='Email ID' register={register("email")} placeHolder='Enter Email.' error={errors.email?.message} disabled={isVerified} />
                        </div>
                        <div className='mb-1.5'>
                            <Dropdown<FormFields>
                                name="gender"
                                control={control}
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
                        {/* 
                        <div className='mb-1.5'>
                            <InputField required
                                type='text'
                                label='License Number'
                                register={register("licenseNo")}
                                placeHolder='Enter license number.'
                                error={errors.licenseNo?.message} />

                        </div> */}

                        <div className='mb-1.5'>
                            <InputField
                                required
                                type='text'
                                label='License Number'
                                register={register("licenseNo")}
                                placeHolder='Enter License Number'
                                error={errors.licenseNo?.message}
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Enter your professional license number as it appears on your ID.
                            </p>
                        </div>

                        <div className='mb-1.5'>
                            <Dropdown<FormFields>
                                name="speciality"
                                control={control}
                                label="Speciality"
                                options={specialityOptions}
                                placeholder="Choose a speciality"
                                error={errors.speciality?.message}
                            />
                            {methods.watch("speciality") === "Other" && (
                                <div className="mt-1.5">
                                    <InputField
                                        required
                                        type="text"
                                        label="Please specify your speciality"
                                        register={register("otherSpeciality")}
                                        placeHolder="Enter your speciality"
                                        error={errors.otherSpeciality?.message}
                                    />
                                </div>
                            )}
                        </div>
                        {/* 👇 Country & State Dropdown 👇 */}
                        {/* <CountryStateSelect isCountryView={true} isStateView={false} /> */}
                        <div className='mb-1.5' />
                        <CountryStateSelect isStateView={true} />
                        <div className='mt-1.5 mb-1.5'>
                            <InputField required label='Password' type='password' register={register("password")} placeHolder='Enter Password.' error={errors.password?.message} />
                            <p className="text-xs text-gray-500 mt-1 leading-tight">
                                Min 10 chars, including 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                            </p>
                        </div>

                        <div className='mb-3.5'>
                            <InputField required label='Confirm Password' type='password' register={register("confirmPassword")} placeHolder='Enter Confirm Password.' error={errors.confirmPassword?.message} />
                        </div>

                        {/* ── HIPAA Consent ── */}
                        <div className="mt-4 mb-2">
                            <label htmlFor="provider-hipaa-consent" className="flex items-start gap-3 cursor-pointer">
                                <span className="relative flex-shrink-0 mt-0.5">
                                    <input
                                        id="provider-hipaa-consent"
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

                            <Button text='sign up' />
                        </div>

                        <p className='font-normal labelNormal  text-center mt-8'> Already have an account? <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/") }} >Sign in</span></p>
                    </form>
                </FormProvider>


            </AuthLayout>
        </>
    )
}

export default ProviderSignup