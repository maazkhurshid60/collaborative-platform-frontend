import { useForm } from 'react-hook-form';
import InputField from '../../../components/inputField/InputField'
import AuthLayout from '../../../layouts/authLayout/AuthLayout'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CnicSchema } from '../../../schema/authSchema/AuthSchema';
import Button from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';


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


    //FUNCTIONS
    const loginFunction = async (data: FormFields) => {

        console.log(data);

        // try {
        //     const response = await authService.login(data);
        //     console.log(response?.data?.user?.user?.role);
        //     localStorage.setItem("token", response?.data?.token)
        //     toast.success(response?.message);
        //     dispatch(saveLoginUserDetailsReducer(response?.data?.user))
        //     if (response?.data?.user?.user?.role === "client") {
        //         navigate("/documents")

        //     } else {

        //         navigate("/dashboard")
        //     }


        // } catch (error) {

        //     const err = error as AxiosError<AuthErrorResponse>;
        //     toast.error(`${err?.response?.data?.data?.error}`);
        // }
    }
    return (
        <AuthLayout heading='sign in'>

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