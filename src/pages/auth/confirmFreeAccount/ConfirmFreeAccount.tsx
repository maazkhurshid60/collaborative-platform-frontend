import { FormProvider, useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProviderSignupSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate, useLocation } from 'react-router-dom';
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
import confirmFreeAccount from "../../../../public/assets/confirm-free-account.png"
import { RootState } from '../../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { addDataNewJoinUserReducer, emptyDataNewJoinUserReducer } from '../../../redux/slices/JoinNowUserSlice';
import { saveDecryptedPrivateKey, saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';
import messageApiService, { updateGroupApiType } from '../../../apiServices/chatApi/messagesApi/MessagesApi';
import { subscriptionApiService } from '../../../services/subscriptionApiService';
import { ArrowLeft, ArrowRight, Check, Info } from 'lucide-react';
import StepIndicator from '../../../components/stepIndicator/StepIndicator';

const features = [
    "Up to 100 Clients",
    "Basic invoicing & billing",
    "Email support",
    "Payment processing",
    "1-on-1 direct messaging only",
    "Add own clients only"
]
type FormFields = z.infer<typeof ProviderSignupSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const ConfirmFreeAccount = () => {
    const [isLoading, setIsLoading] = useState(false)
    const joinUser = useSelector((state: RootState) => state?.joinUserSlice?.data)
    console.log("joinUserSlice", joinUser);


    const methods = useForm<FormFields>({
        resolver: zodResolver(ProviderSignupSchema),
        mode: "onChange",
        criteriaMode: "all"
    });

    const { register, handleSubmit, formState: { errors }, setValue, control } = methods;
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation() as { state: any };
    //FUNCTIONS
    const signupFunction = async (data: FormFields) => {
        setIsLoading(true)
        // 1️⃣ Generate key pair
        const keyPair = nacl.box.keyPair();
        const publicKey = naclUtil.encodeBase64(keyPair.publicKey);
        const privateKey = naclUtil.encodeBase64(keyPair.secretKey);

        // 2️⃣ Encrypt private key using user's password
        const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, data.password).toString();

        // 3️⃣ Combine all fields including public + encrypted private key
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
        };
        console.log("log", dataSendToBackend);
        // const dataSendToBackend = { email: data?.email, isApprove: "pending", password: data?.password, fullName: data?.fullName, licenseNo: data?.licenseNo, department: data?.department, role: "provider", country: data?.country, state: data?.state };
        try {
            const response = await authService.signup(dataSendToBackend);
            toast.success(response?.message);
            if (joinUser?.isNewJoin) {
                const dataSendToBack = { groupId: joinUser?.groupId, memberEmail: joinUser?.memberEmail }
                await updateGroupApi(dataSendToBack)
                dispatch(emptyDataNewJoinUserReducer())
            }
            // navigate("/")
        } catch (error: unknown) {
            const err = error as AxiosError<AuthErrorResponse>;

            toast.error(`${err?.response?.data?.data?.error}`);
        } finally {
            setIsLoading(false)

        }
    }


    const updateGroupApi = async (dataSendToBack: updateGroupApiType) => {
        try {
            const response = await messageApiService.updateGroupApi(dataSendToBack)

            console.log(response);
            toast.success('You have joined the group. Please login yourself and go chat for more information once you verified in next 24hours .')

        } catch (err) {
            console.error("❌:", err);

            let errorMessage = "Error loading messages.";

            // If err is an Error object (normal case)
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            // If err was thrown as a string
            else if (typeof err === "string") {
                errorMessage = err;
            }

            toast.error(errorMessage);

            const newJoinDataSendToBack = { ...dataSendToBack, isNewJoin: true }
            dispatch(addDataNewJoinUserReducer(newJoinDataSendToBack))
            // console.error('❌:', err);

            // // If error contains a specific message, show it in the toast
            // if (err) {
            //     toast.error(err || 'Error loading messages.');
            //     const newJoinDataSendToBack = { ...dataSendToBack, isNewJoin: true }

            //     dispatch(addDataNewJoinUserReducer(newJoinDataSendToBack))

            // }
        }
    }

    useEffect(() => {

        if (joinUser?.memberEmail) {
            setValue("email", joinUser.memberEmail)
        }

    }, [joinUser])


    return (
        <>
            {isLoading && <Loader />}
            <div className='flex min-h-screen items-stretch'>
                {/* Left Side - Form Section */}

                <div className='w-full md:w-[60%] lg:w-1/2 flex flex-col items-center justify-center md:py-8 lg:py-[60px]'>
                    <StepIndicator currentStep={2} totalSteps={2} />
                    <div className='w-full md:w-[90%] lg:w-[70%] rounded-[20px]  max-w-screen  bg-white px-6 md:px-8 lg:px-14 py-4 md:drop-shadow-md'>
                        <p className='heading text-left mb-4 capitalize'>Confirm Your Free Account</p>
                        {/* Features */}
                        <div className={`mt-auto p-6 rounded-[16px] bg-inputBgColor`}>
                            <ul className="space-y-4">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0">
                                            <Check size={18} className={'text-[#059669]'} strokeWidth={3} />
                                        </div>
                                        <span className={`text-[14px] text-[#666666]`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#FFFBEB] mt-4 w-full min-h-[107px] rounded-[8px] p-4 pt-6 flex flex-col">
                            <div className="flex flex-row items-center align-middle gap-2">
                                <Info size={24} className="text-[#D97706]" />
                                <p className="text-[16px] font-medium text-[#78350F]">Limited Features Included</p>
                            </div>
                            <div className="flex flex-col gap-2 mt-2 ml-6">
                                <p className="text-[14px] font-normal text-[#78350F]">Your free account includes basic features to get you started. Upgrade anytime to unlock advanced capabilities </p>
                            </div>
                        </div>
                        <p className="text-[12px] mt-4 text-[#64748B] text-center max-w-[450px]">
                            By starting your free trial, you agree to our <a href="https://kolabme.com/terms-and-conditions" className="text-[#2C9993] hover:underline cursor-pointer">Terms of Service</a> and <a href="https://kolabme.com/privacy-policy/" className="text-[#2C9993] hover:underline cursor-pointer">Privacy Policy</a>
                        </p>

                        <div className='w-full mt-6 border border-[#E5E7EB]' />
                        <p className='text-[18px] mt-4 text-[#333333] font-[Poppins] font-medium text-center max-w-[450px]'>
                            Need more features for your team?
                        </p>
                        <button className='flex flex-row items-center justify-center gap-2 w-full mt-4 py-2'>
                            <p className='text-[16px] font-medium font-[Poppins] text-[#2C9993] cursor-pointer'>View Pricing Plans </p>
                            <ArrowRight size={18} className={'text-[#2C9993]'} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="w-full md:w-[90%] lg:w-[70%] flex flex-row items-center mt-20 justify-between gap-x-2">
                        <button className="flex flex-row items-center gap-2 border-[#2C9993] border text-[#2C9993] cursor-pointer hover:text-white hover:bg-[#2C9993] px-4 py-2 rounded-lg">
                            <ArrowLeft size={18} className={'text-inherit'} strokeWidth={3} />
                            Back
                        </button>
                        <button
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    // Validation: Check if we have userData for new signups
                                    if (!location.state?.userData) {
                                        toast.error("Session expired. Please signup again.");
                                        navigate('/provider-signup');
                                        return;
                                    }

                                    const planType = location.state?.planType || 'FREE';

                                    // Create account with plan in one call
                                    const signupData = {
                                        ...location.state.userData,
                                        planType  // Include planType in signup request
                                    };

                                    const response = await authService.signup(signupData);
                                    const token = response?.data?.token;
                                    const user = response?.data?.user;

                                    if (token && user) {
                                        localStorage.setItem("token", token);

                                        // Decrypt Private Key
                                        const encryptedPrivateKey = user?.user?.privateKey;
                                        if (encryptedPrivateKey) {
                                            try {
                                                const decryptedKeyString = CryptoJS.AES.decrypt(encryptedPrivateKey, location.state.userData.password).toString(CryptoJS.enc.Utf8);
                                                const decryptedPrivateKeyUint8 = naclUtil.decodeBase64(decryptedKeyString);
                                                const base64Key = naclUtil.encodeBase64(decryptedPrivateKeyUint8);
                                                dispatch(saveDecryptedPrivateKey(base64Key));
                                            } catch (decryptError) {
                                                console.error("Failed to decrypt private key:", decryptError);
                                            }
                                        }

                                        const fixedUserData = {
                                            ...user,
                                            clientList: user?.clientList?.map((item: any) => item.client) || []
                                        };
                                        dispatch(saveLoginUserDetailsReducer(fixedUserData));
                                    }

                                    // Clear join user state if any
                                    if (joinUser?.isNewJoin) {
                                        const dataSendToBack = { groupId: joinUser?.groupId, memberEmail: joinUser?.memberEmail }
                                        await messageApiService.updateGroupApi(dataSendToBack)
                                        dispatch(emptyDataNewJoinUserReducer())
                                    }

                                    const successMessage = planType === 'FREE'
                                        ? "14-day free trial activated!"
                                        : "Free 14-day trial plan activated!";
                                    toast.success(successMessage);
                                    navigate('/dashboard');
                                } catch (error: any) {
                                    console.error(error);
                                    if (error?.response?.status === 429) {
                                        toast.error("Too Many Request Please Try again later");
                                    } else {
                                        const errorMessage = error.response?.data?.message || "Failed to create account.";

                                        // Handle specific error cases
                                        if (errorMessage.includes("already exists")) {
                                            toast.error("Account already exists. Please login.");
                                            navigate('/login');
                                        } else {
                                            toast.error(errorMessage);
                                        }
                                    }
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            className="bg-[#2C9993] text-white cursor-pointer hover:bg-[#2C9993]/90 px-4 py-2 rounded-lg disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (location.state?.planType === 'FREE' ? 'Start 14-Day Free Trial' : 'Confirm Free Plan')}
                        </button>
                    </div>
                </div>

                {/* Right Side - Image Section */}
                <div className='hidden md:flex md:w-[40%] lg:w-1/2 bg-primaryColorLight items-center justify-center rounded-bl-[20px] rounded-tl-[20px]'>
                    <img
                        src={confirmFreeAccount}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className='w-full max-h-screen object-cover'
                    />

                </div>
            </div>
        </>
    )
}

export default ConfirmFreeAccount