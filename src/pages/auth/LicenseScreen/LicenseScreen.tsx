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

            const userData = response.data?.data;
            if (!userData) {
                // This shouldn't happen if backend returns 404 for not found, but safe handling
                toast.error("License record is empty");
                return;
            }

            const dataSendToRedux = {
                email: userData.email,
                licenseNo: userData.licenseNo,
                fullName: userData.fullName,
                clientId: userData.client?.id,
                isClientExist: true,
                gender: userData.gender,
                age: userData.age,
                contactNo: userData.contactNo,
                address: userData.address,
                status: userData.status,
                state: userData.state,
                country: userData.country,
                isApprove: userData.isApprove,
                isAccountCreatedByOwnClient: userData.client?.isAccountCreatedByOwnClient ?? false
            };

            dispatch(saveLicenseNoResult(dataSendToRedux));
            navigate("/client-signup", { state: { fromLicense: true } });

        } catch (error) {
            const err = error as AxiosError<AuthErrorResponse>;
            const errorMessage = err?.response?.data?.data?.error || "Something went wrong";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }
    return (<>
        {isLoading && <Loader />}
        <AuthLayout heading='sign up'>

            <form onSubmit={handleSubmit(loginFunction)}>
                <div className='mb-4'>
                    <InputField required label='License Number' type='text' register={register("licenseNo")} placeHolder='Enter licenseNo.' error={errors.licenseNo?.message} />
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
