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

const departmentOptions = [
    { value: "Nutritionist", label: "Nutritionist" },
    { value: "Psychiatrist", label: "Psychiatrist" },
    { value: "Therapist", label: "Therapist" },
    { value: "Eye Specialist", label: "Eye Specialist" },
    { value: "Heart Specialist", label: "Heart Specialist" },
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

            // Handle 409 Conflict (email exists)
            if (error?.response?.status === 409) {
                toast.error("Email is already registered");
                return;
            }

            // Handle other errors
            console.error("Email check error:", error);
            toast.error("Please Enter Valid Email.");
            return;
        }

        const keyPair = nacl.box.keyPair();
        const publicKey = naclUtil.encodeBase64(keyPair.publicKey);
        const privateKey = naclUtil.encodeBase64(keyPair.secretKey);
        const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, data.password).toString();

        const dataSendToBackend = {
            email: data.email,
            fullName: data.fullName,
            password: data.password,
            licenseNo: data.licenseNo,
            department: data.department,
            country: data.country,
            state: data.state,
            isApprove: "pending",
            role: "provider",
            publicKey: publicKey,
            privateKey: encryptedPrivateKey,
            inviteToken: token || undefined,
        };


        // If invited (has token), skip plan selection and go to confirm free trial
        if (token) {
            setIsLoading(false);
            navigate("/confirm-free-account", {
                state: {
                    userData: dataSendToBackend,
                    planType: 'FREE' // Free triggers the 14-day Stripe trial backend logic
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
                        </div>
                        <div className='mb-1.5'>
                            <InputField required label='Email ID' register={register("email")} placeHolder='Enter Email.' error={errors.email?.message} disabled={isVerified} />
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
                                placeHolder='e.g. AB12@cd'
                                error={errors.licenseNo?.message}
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Must include at least 1 letter, 1 number, and 1 special character (min 6 chars).
                            </p>
                        </div>

                        <div className='mb-1.5'>
                            <Dropdown<FormFields>
                                name="department"
                                control={control}
                                label="Department"
                                options={departmentOptions}
                                placeholder="Choose an option"
                                error={errors.department?.message}

                            />
                        </div>
                        {/* 👇 Country & State Dropdown 👇 */}
                        <CountryStateSelect isCountryView={true} isStateView={false} />
                        <div className='mb-1.5' />
                        <CountryStateSelect isCountryView={false} isStateView={true} />
                        <div className='mt-1.5 mb-1.5'>
                            <InputField required label='Password' type='password' register={register("password")} placeHolder='Enter Password.' error={errors.password?.message} />
                        </div>

                        <div className='mb-1.5'>
                            <InputField required label='Confirm Password' type='password' register={register("confirmPassword")} placeHolder='Enter Confirm Password.' error={errors.confirmPassword?.message} />
                        </div>
                        <div className='mt-10'>

                            <Button text='sign up' />
                        </div>

                        <p className='font-normal labelNormal  text-center mt-8'> Already have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/") }} >Sign in</span></p>
                    </form>
                </FormProvider>


            </AuthLayout>
        </>
    )
}

export default ProviderSignup