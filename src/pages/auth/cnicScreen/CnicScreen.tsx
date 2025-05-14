import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CnicSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import authService from '../../../apiServices/authApi/AuthApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { AuthErrorResponse } from '../../../types/axiosType/AxiosType';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { saveCNICResult } from '../../../redux/slices/LoginUserDetailSlice';


type FormFields = z.infer<typeof CnicSchema>;

export interface ISigninData {
    emailOrUsername: string;
    password: string;
}
const CnicScreen = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(CnicSchema),
    });
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()


    //FUNCTIONS
    const loginFunction = async (cnic: FormFields) => {

        console.log(cnic);

        try {
            const response = await authService.findCnic(cnic);
            toast.success(response?.message);
            console.log("response.data.data", response.data.data);
            if (response.data.data !== null) {
                const dataSendToRedux = {
                    email: response?.data?.data?.client?.email,
                    cnic: response?.data?.data?.cnic,
                    fullName: response?.data?.data?.fullName,
                    clientId: response?.data?.data?.client?.id,
                    isClientExist: true,
                    gender: response?.data?.data?.gender,
                    age: response?.data?.data?.age,
                    contactNo: response?.data?.data?.contactNo,
                    address: response?.data?.data?.address,
                    status: response?.data?.data?.status,
                }
                dispatch(saveCNICResult(dataSendToRedux))
                navigate("/client-signup")
            } else {
                const dataSendToRedux = {
                    email: "",
                    cnic: "",
                    fullName: "",
                    isClientExist: false
                }
                dispatch(saveCNICResult(dataSendToRedux))
                navigate("/client-signup")
            }
        } catch (error) {
            console.log(error);

            const err = error as AxiosError<AuthErrorResponse>;
            toast.error(`${err?.response?.data?.data?.error}`);
        }
    }
    return (
        <AuthLayout heading='sign up'>

            <form onSubmit={handleSubmit(loginFunction)}>
                <div className='mb-4'>
                    <InputField required label='CNIC' register={register("cnic")} name='cnic' placeHolder='Enter CNIC.' error={errors.cnic?.message} />
                </div>
                <div className='mt-10'>

                    <Button text='sign up' />
                </div>

                <p className='font-normal labelNormal  text-center mt-14'> Don’t have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/provider-signup") }}>Sign up</span></p>
            </form>

        </AuthLayout>
    )
}

export default CnicScreen
