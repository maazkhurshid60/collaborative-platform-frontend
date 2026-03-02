import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientIdSchema } from '../../../schema/authSchema/AuthSchema';
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


type FormFields = z.infer<typeof ClientIdSchema>;
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
        resolver: zodResolver(ClientIdSchema),
    });
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    //FUNCTIONS
    const loginFunction = async (identifiers: FormFields) => {
        setIsLoading(true)
        try {
            const response = await authService.findLicenseNo({ clientId: identifiers.clientId });
            toast.success(response?.message);

            const userData = response.data;
            if (!userData) {
                // This shouldn't happen if backend returns 404 for not found, but safe handling
                toast.error("License record is empty");
                return;
            }

            const dataSendToRedux = {
                email: userData.email,
                clientId: userData.client?.clientId || userData.client?.id, // Use string representation
                licenseNo: null as any,
                fullName: userData.fullName,
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
            const errorMessage = err?.response?.data?.data?.error || "Something went                   ";
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
                    <InputField required label='Client ID' type='text' register={register("clientId")} placeHolder='Enter Client ID' error={errors.clientId?.message} />
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