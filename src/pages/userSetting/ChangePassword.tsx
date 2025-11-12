import OutletLayout from '../../layouts/outletLayout/OutletLayout'
import InputField from '../../components/inputField/InputField';
import Button from '../../components/button/Button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ChangePasswordSchema } from '../../schema/authSchema/AuthSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import loginUserApiService from '../../apiServices/loginUserApi/LoginUserApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { AuthErrorResponse } from '../../types/axiosType/AxiosType';
import { useNavigate } from 'react-router-dom';
import BackIcon from '../../components/icons/back/Back';
import { useState } from 'react';
import Loader from '../../components/loader/Loader';

type FormFields = z.infer<typeof ChangePasswordSchema>;

const ChangePassword = () => {
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);

    const { handleSubmit, register, formState: { errors } } = useForm<FormFields>({ resolver: zodResolver(ChangePasswordSchema) })

    const changePasswordFunc = async (data: FormFields) => {
        setIsLoading(true)
        try {
            const dataSendToBackend = { ...data, role: loginUserDetail.user.role, loginUserId: loginUserDetail.id }

            const response = await loginUserApiService.changePasswordApi(dataSendToBackend)
            toast.success(response.message);
            localStorage.removeItem("token")
            navigate("/")
        } catch (error) {
            const err = error as AxiosError<AuthErrorResponse>;

            toast.error(`${err}`);
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <>
            {isLoading && <Loader />}
            <div className='relative'>
                <div className='absolute top-0 left-0'>

                    <BackIcon onClick={() => navigate(-1)} />
                </div>
                <OutletLayout heading='Settings'>
                    <form
                        onSubmit={handleSubmit(changePasswordFunc)}
                        className='mt-6'
                    >
                        <div className='grid lg:grid-cols-3 gap-x-4'>

                            <InputField label='Old Password' required type='password' register={register('oldPassword')} error={errors?.oldPassword?.message} placeHolder='Enter old password' />
                            <InputField label='New Password' required type='password' register={register('newPassword')} error={errors?.newPassword?.message} placeHolder='Enter new password' />
                            <InputField label='Confirm Password' required type='password' register={register('confirmPassword')} error={errors.confirmPassword?.message} placeHolder=' Enter confirm password' />
                        </div>

                        <div className='flex justify-end  w-[100%] mt-6'>
                            <div className='w-[100px]' >
                                <Button text='Save' sm />
                            </div>
                        </div>

                    </form>
                </OutletLayout >
            </div>
        </>
    )
}

export default ChangePassword