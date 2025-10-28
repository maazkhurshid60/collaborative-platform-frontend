import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LicenseNoSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import authService from '../../../apiServices/authApi/AuthApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { saveLicenseNoResult } from '../../../redux/slices/LoginUserDetailSlice';
import { useState } from 'react';
import Loader from '../../../components/loader/Loader';


type FormFields = z.infer<typeof LicenseNoSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const LicenseNo = () => {
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(LicenseNoSchema),
    });
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()


    //FUNCTIONS
    const loginFunction = async (licenseNo: FormFields) => {
        setIsLoading(true)


        try {
            const response = await authService.findLicenseNo(licenseNo);
            toast.success(response?.message);
            if (response.data.data !== null) {
                const dataSendToRedux = {
                    email: response?.data?.data?.client?.email,
                    licenseNo: response?.data?.data?.licenseNo,
                    fullName: response?.data?.data?.fullName,
                    clientId: response?.data?.data?.client?.id,
                    isClientExist: true,
                    gender: response?.data?.data?.gender,
                    age: response?.data?.data?.age,
                    contactNo: response?.data?.data?.contactNo,
                    address: response?.data?.data?.address,
                    status: response?.data?.data?.status,
                    state: response?.data?.data?.state,
                    country: response?.data?.data?.country,
                    isApprove: response?.data?.data?.isApprove,
                }
                dispatch(saveLicenseNoResult(dataSendToRedux))

                navigate("/client-signup")
            } else {
                const dataSendToRedux = {
                    email: "",
                    licenseNo: "",
                    fullName: "",
                    isClientExist: false
                }
                dispatch(saveLicenseNoResult(dataSendToRedux))
                navigate("/client-signup")
            }
        } catch (error) {

            const err = error as AxiosError<AuthErrorResponse>;
            toast.error(`${err?.response?.data?.data?.error}`);
        } finally {
            setIsLoading(false)

        }
    }
    return (<>
        {isLoading && <Loader />}
        <AuthLayout heading='sign up'>

            <form onSubmit={handleSubmit(loginFunction)}>
                <div className='mb-4'>
                    <InputField required label='License Number' register={register("licenseNo")} placeHolder='Enter licenseNo.' error={errors.licenseNo?.message} />
                </div>
                <div className='mt-10'>

                    <Button text='sign up' />
                </div>

                <p className='font-normal labelNormal  text-center mt-14'> Already have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/") }}>Sign in</span></p>
            </form>

        </AuthLayout>
    </>
    )
}

export default LicenseNo
