import { useForm } from 'react-hook-form';
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
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(ProviderSignupSchema),
    });

    const navigate = useNavigate()
    //FUNCTIONS
    const signupFunction = async (data: FormFields) => {
        const dataSendToBackend = { email: data?.email, passwoed: data?.password, fullName: data?.fullName, cnic: data?.cnic, department: data?.department, role: "provider" };
        console.log(dataSendToBackend);

        try {
            const response = await authService.signup(dataSendToBackend);
            toast.success(response?.message);
            navigate("/")
        } catch (error: unknown) {
            const err = error as AxiosError<AuthErrorResponse>;

            toast.error(`${err?.response?.data?.data?.error}`);
        }
    }




    return (
        <AuthLayout heading="Sign up">
            <form onSubmit={handleSubmit(signupFunction)}>
                <div className='mb-1.5'>
                    <InputField required label='Full Name' register={register("fullName")} name='fullName' placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                </div>
                <div className='mb-1.5'>
                    <InputField required label='Email' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                </div>
                <div className='mb-1.5'>
                    <Dropdown<FormFields>
                        name="department"
                        label="Department"
                        control={control}
                        options={departmentOptions}
                        placeholder="Choose an option"
                        error={errors.department?.message}
                    />                </div>
                <div className='mb-1.5'>
                    <InputField required
                        label='CNIC No'
                        register={register("cnic")}
                        name='cnic' placeHolder='Enter CNIC.'
                        error={errors.cnic?.message} />
                </div>
                <div className='mb-1.5'>
                    <InputField required label='Password' type='password' register={register("password")} name='password' placeHolder='Enter Password.' error={errors.password?.message} />
                </div>

                <div className='mb-1.5'>
                    <InputField required label='Confirm Password' type='password' register={register("confirmPassword")} name='confirmPassword' placeHolder='Enter Confirm Password.' error={errors.confirmPassword?.message} />
                </div>
                <div className='mt-10'>

                    <Button text='sign up' />
                </div>

                <p className='font-normal labelNormal  text-center mt-14'> Already have an account <span className='capitalize text-greenColor underline font-bold cursor-pointer' onClick={() => { navigate("/") }} >Sign in</span></p>
            </form>

        </AuthLayout>
    )
}

export default ProviderSignup