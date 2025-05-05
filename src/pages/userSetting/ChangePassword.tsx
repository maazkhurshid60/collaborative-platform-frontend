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

type FormFields = z.infer<typeof ChangePasswordSchema>;

const ChangePassword = () => {
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const navigate = useNavigate()
    console.log(loginUserDetail.user.role);

    const { handleSubmit, register, formState: { errors } } = useForm<FormFields>({ resolver: zodResolver(ChangePasswordSchema) })

    const changePasswordFunc = async (data: FormFields) => {
        try {
            console.log(data);
            const dataSendToBackend = { ...data, role: loginUserDetail.user.role, loginUserId: loginUserDetail.id }
            console.log(dataSendToBackend);

            const response = await loginUserApiService.changePasswordApi(dataSendToBackend)
            toast.success(response.message);
            localStorage.removeItem("token")
            navigate("/")
        } catch (error) {
            const err = error as AxiosError<AuthErrorResponse>;
            console.log(err);

            toast.error(`${err}`);
        }

    }

    return (
        <OutletLayout heading='Settings'>

            <form
                onSubmit={handleSubmit(changePasswordFunc)}
                className='mt-6'
            >
                <div className='grid grid-cols-3 gap-x-4'>

                    <InputField label='Old Password' required type='password' register={register('oldPassword')} name='oldPassword' error={errors?.oldPassword?.message} placeHolder='Enter old password' />
                    <InputField label='New Password' required type='password' register={register('newPassword')} name='newPassword' error={errors?.newPassword?.message} placeHolder='Enter new password' />
                    <InputField label='Confirm Password' required type='password' register={register('confirmPassword')} name='confirmPassword' error={errors.confirmPassword?.message} placeHolder='Enter confirm password' />
                </div>

                <div className='flex justify-end  w-[100%] mt-6'>
                    <div className='w-[100px]' >
                        <Button text='Save' sm />
                    </div>
                </div>

            </form>
        </OutletLayout >)
}

export default ChangePassword