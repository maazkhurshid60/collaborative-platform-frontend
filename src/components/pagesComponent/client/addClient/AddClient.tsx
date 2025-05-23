
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../icons/back/Back'
import { useNavigate } from 'react-router-dom'
import Button from '../../../button/Button'
import InputField from '../../../inputField/InputField'
import Dropdown from '../../../dropdown/Dropdown'
import LabelData from '../../../labelText/LabelData'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema } from '../../../../schema/clientSchema/ClientSchema'
import { statusOption } from '../../../../constantData/statusOptions'
import UserIcon from '../../../icons/user/User'
import { ClientType } from '../../../../types/clientType/ClientType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clientApiService from '../../../../apiServices/clientApi/ClientApi'
import { useState } from 'react'
import Loader from '../../../loader/Loader'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import Checkbox from '../../../checkbox/Checkbox'
type FormFields = z.infer<typeof clientSchema>

const AddClient = () => {
    const { register, control, formState: { errors }, handleSubmit } = useForm<FormFields>({ resolver: zodResolver(clientSchema) })
    const navigate = useNavigate()
    const [isLoader, setIsLoader] = useState(false)
    const queryClient = useQueryClient()
    const providerId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)
    const [wantToBeSeen, setWantToBeSeen] = useState(false);

    const handleCheckboxChange = () => {
        setWantToBeSeen((prev) => !prev);
    };
    const addFunction = (data: FormFields) => {
        updateMutation.mutate(data)
    }


    const updateMutation = useMutation({
        mutationFn: async (data: ClientType) => {
            const dataSendToBackend = { ...data, isAccountCreatedByOwnClient: false, age: data && parseInt(data?.user?.age ?? "18"), providerId, role: "client" }
            console.log(dataSendToBackend);

            await clientApiService.addClientApi(dataSendToBackend);
        },
        onMutate: () => {
            setIsLoader(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success("Account has created successfully")

            setIsLoader(false)
        },
        onError: () => {
            // toast.error('Failed to add the client!');
            setIsLoader(false)
        },

    });

    return (
        <OutletLayout heading='Add Client'>
            {isLoader && <Loader text='Adding...' />}

            <div className='relative'>
                <div className='absolute  -left-6 -top-12 md:-top-14 lg:-left-5'>

                    <BackIcon onClick={() => navigate("/clients")} />
                </div>
            </div>
            <form onSubmit={handleSubmit(addFunction)} className="mt-6">
                <div>
                    <LabelData label='Upload Image' />
                    <UserIcon className='text-6xl mt-2' onClick={() => toast.success("This feature is comming soon.")} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
                    <div className=''>
                        <InputField required label='Full Name' register={register("fullName")} name='fullName' placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                    </div>
                    <div className=''>
                        <InputField required
                            label='CNIC Number'
                            register={register("cnic")}
                            name='cnic' placeHolder='Enter CNIC.'
                            error={errors.cnic?.message} />
                    </div>
                    <div className=''>
                        <InputField required label='Age' register={register("age")} name='age' placeHolder='Enter Age.' error={errors.age?.message} />
                    </div>
                    <div className=''>
                        <InputField required label='Email' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                    </div>

                    <div className=''>
                        <InputField required label='Contact No' register={register("contactNo")} name='contactNo' placeHolder='Enter contact.' error={errors.contactNo?.message} />
                    </div>

                    <div className=''>
                        <InputField required label='Address' register={register("address")} name='address' placeHolder='Enter Address.' error={errors.address?.message} />
                    </div>
                    <div className=''>
                        <Dropdown<FormFields>
                            name="gender"
                            label="Gender"
                            control={control}
                            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
                            placeholder="Choose an option"
                            error={errors.gender?.message}
                            required
                        />
                    </div>
                    <div className=''>
                        <Dropdown<FormFields>
                            name="status"
                            label="Status"
                            control={control}
                            options={statusOption}
                            placeholder="Choose an option"
                            required
                            error={errors.status?.message}
                        />                </div>


                </div>
                <div className='mt-8'
                >
                    <Checkbox
                        text="Want to be seen by different providers for this client"
                        checked={wantToBeSeen}
                        onChange={handleCheckboxChange}
                    />
                </div>
                <div className="flex items-center justify-end">

                    <div className='mt-10  w-[100px]'>

                        <Button text='Save' />
                    </div>
                </div>
            </form>
        </OutletLayout>
    )
}

export default AddClient