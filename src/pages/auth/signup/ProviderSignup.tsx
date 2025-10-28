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
import messageApiService, { updateGroupApiType } from '../../../apiServices/chatApi/messagesApi/MessagesApi';

const departmentOptions = [
    { value: "nutritionist", label: "Nutritionist" },
    { value: "psychiatrist", label: "Psychiatrist" },
    { value: "therapist", label: "Therapist" },
    { value: "eyeSpecialist", label: "Eye Specialist" },
    { value: "heartSpecialist", label: "Heart Specialist" },
]

type FormFields = z.infer<typeof ProviderSignupSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const ProviderSignup = () => {
    const [isLoading, setIsLoading] = useState(false)
    const joinUser = useSelector((state: RootState) => state?.joinUserSlice?.data)
    console.log("joinUserSlice", joinUser);


    const methods = useForm<FormFields>({
        resolver: zodResolver(ProviderSignupSchema),
        mode: "onChange",
        criteriaMode: "all"
    });

    const { register, handleSubmit, formState: { errors }, setValue } = methods;
    const dispatch = useDispatch()
    const navigate = useNavigate()
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
            <AuthLayout heading="Sign up">
                <FormProvider {...methods}>

                    <form onSubmit={handleSubmit(signupFunction)}>
                        <div className='mb-1.5'>
                            <InputField required label='Full Name' register={register("fullName")} placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                        </div>
                        <div className='mb-1.5'>
                            <InputField required label='Email ID' register={register("email")} placeHolder='Enter Email.' error={errors.email?.message} />
                        </div>

                        <div className='mb-1.5'>
                            <InputField required
                                label='License Number'
                                register={register("licenseNo")}
                                placeHolder='Enter license number.'
                                error={errors.licenseNo?.message} />
                        </div>
                        <div className='mb-1.5'>
                            <Dropdown<FormFields>
                                name="department"
                                label="Department"
                                options={departmentOptions}
                                placeholder="Choose an option"
                                error={errors.department?.message}
                            />
                        </div>
                        {/* 👇 Country & State Dropdown 👇 */}
                        <CountryStateSelect isCountryView={true} isStateView={false} />
                        <CountryStateSelect isCountryView={false} isStateView={true} />
                        <div className='mb-1.5'>
                            <InputField required label='Password' type='password' register={register("password")} placeHolder='Enter Password.' error={errors.password?.message} />
                        </div>

                        <div className='mb-1.5'>
                            <InputField required label='Confirm Password' type='password' register={register("confirmPassword")} placeHolder='Enter Confirm Password.' error={errors.confirmPassword?.message} />
                        </div>
                        <div className='mt-10'>

                            <Button text='sign up' />
                        </div>

                        <p className='font-normal labelNormal  text-center mt-14'> Already have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/") }} >Sign in</span></p>
                    </form>
                </FormProvider>


            </AuthLayout>
        </>
    )
}

export default ProviderSignup